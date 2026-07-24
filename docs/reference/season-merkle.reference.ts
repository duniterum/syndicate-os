/**
 * ⛔ ORIGIN FORMAT — SUPERSEDED FOR S3 (banner added 2026-07-24, pre-S3 audit).
 * This file documents the ORIGIN's SeasonRewardsPool v1 leaf format
 * (single-hash `abi.encodePacked(msg.sender, amount)`, one global root, no
 * domain tag) — the EXACT replay-vulnerable class the dossier §0.7 KILLS.
 * The S3 leaf spec is season-merkle v2: OZ StandardMerkleTree, double-hash
 * `abi.encode`, domain-tagged `(kind, chainId, address(this), roundId,
 * account, amount)`, per-round immutable roots (dossier §0.7 + §0.14-C).
 * This file is a QUARRY RECORD only — never copy its leafFor into S3.
 *
 * season-merkle.ts — générateur + vérificateur Merkle au FORMAT EXACT de
 * `Supa-Exchange/contracts/SeasonRewardsPool.sol`.
 *
 * Pourquoi ce script existe : le contrat vérifie
 *     leaf = keccak256(abi.encodePacked(msg.sender, amount))     // hash SIMPLE
 *     MerkleProof.verify(proof, root, leaf)                       // OZ = paires TRIÉES
 * Si l'arbre est généré autrement (SDK thirdweb, OZ StandardMerkleTree = double-hash +
 * abi.encode), TOUTES les preuves revert `InvalidMerkleProof`. C'était très probablement
 * ton bug. Ce script produit un arbre qui matche le contrat à 100 %, et le PROUVE
 * (offline + on-chain via verifyClaim) AVANT tout mainnet.
 *
 * ⚠️ DOCTRINE : ceci est le RAIL CASH DISCRÉTIONNAIRE (bounty d'effort, USDC, lawyer-gated).
 * Ce n'est PAS le reward par défaut d'une season (qui est la RECONNAISSANCE, sans claim).
 * Merit jamais chance ; USDC jamais SYN.
 *
 * ── Install ────────────────────────────────────────────────────────────────
 *   pnpm add -D merkletreejs keccak256      # viem est déjà dans le repo
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *   # 1) génère root + preuves depuis une distribution
 *   tsx season-merkle.ts build ./distribution.season-3.json ./out.season-3.json
 *
 *   # 2) (optionnel mais recommandé) prouve on-chain que le contrat accepte
 *   RPC_URL=https://... POOL_ADDRESS=0x... tsx season-merkle.ts verify ./out.season-3.json
 *
 * distribution.season-3.json  =  [{ "address": "0x..", "amount": "12.5" }, ...]
 *   - `amount` est en USDC HUMAIN (12.5 = 12,5 USDC) et scalé en 6 décimales.
 *   - passe RAW_UNITS=true si tes montants sont déjà en base units (1 USDC = 1_000_000).
 */

import { readFileSync, writeFileSync } from 'node:fs'
import {
  encodePacked,
  parseUnits,
  getAddress,
  isAddress,
  createPublicClient,
  http,
  type Address,
} from 'viem'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

// USDC sur Avalanche C-Chain = 6 décimales. Ne change ça que si tu changes de token.
const USDC_DECIMALS = 6
const RAW_UNITS = process.env.RAW_UNITS === 'true'

type DistEntry = { address: string; amount: string | number }
type OutEntry = { address: Address; amount: string; proof: `0x${string}`[] }

// ── Le leaf : IDENTIQUE à `keccak256(abi.encodePacked(address, uint256))` du contrat ──
function leafFor(address: Address, amount: bigint): Buffer {
  const packed = encodePacked(['address', 'uint256'], [address, amount]) // 0x…
  return keccak256(Buffer.from(packed.slice(2), 'hex')) // Buffer 32B, hash simple
}

function scale(amount: string | number): bigint {
  if (RAW_UNITS) return BigInt(amount)
  return parseUnits(String(amount), USDC_DECIMALS)
}

// ── BUILD ───────────────────────────────────────────────────────────────────
function build(distPath: string, outPath: string) {
  const raw = JSON.parse(readFileSync(distPath, 'utf8')) as DistEntry[]
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('distribution vide')

  // validation + dédoublonnage + checksum
  const seen = new Set<string>()
  const entries = raw.map((e, i) => {
    // strict:false = on valide le FORMAT (0x + 40 hex), pas le casing EIP-55 :
    // une distribution contient souvent des adresses en minuscules. On re-checksumme ensuite.
    if (typeof e.address !== 'string' || !isAddress(e.address, { strict: false }))
      throw new Error(`ligne ${i}: adresse invalide ${e.address}`)
    const address = getAddress(e.address) // normalisée + checksummée
    const key = address.toLowerCase()
    if (seen.has(key)) throw new Error(`adresse en double: ${address}`)
    seen.add(key)
    const amount = scale(e.amount)
    if (amount <= 0n) throw new Error(`ligne ${i}: montant <= 0`)
    return { address, amount }
  })

  const leaves = entries.map((e) => leafFor(e.address, e.amount))

  // sortLeaves + sortPairs = config canonique compatible OZ MerkleProof.verify
  const tree = new MerkleTree(leaves, keccak256, { sortLeaves: true, sortPairs: true })
  const merkleRoot = tree.getHexRoot() as `0x${string}`

  const out: OutEntry[] = entries.map((e) => ({
    address: e.address,
    amount: e.amount.toString(), // base units (ce que claim() attend)
    proof: tree.getHexProof(leafFor(e.address, e.amount)) as `0x${string}`[],
  }))

  const total = entries.reduce((a, e) => a + e.amount, 0n)

  // ── SELF-TEST OFFLINE : chaque preuve DOIT vérifier, sinon on n'écrit rien ──
  let failures = 0
  for (const e of entries) {
    const leaf = leafFor(e.address, e.amount)
    if (!tree.verify(tree.getHexProof(leaf), leaf, merkleRoot)) {
      console.error(`❌ preuve invalide pour ${e.address}`)
      failures++
    }
  }
  if (failures > 0) throw new Error(`${failures} preuve(s) invalide(s) — ARRÊT`)

  writeFileSync(
    outPath,
    JSON.stringify({ merkleRoot, decimals: USDC_DECIMALS, totalBaseUnits: total.toString(), count: out.length, entries: out }, null, 2),
  )

  console.log('✅ BUILD OK')
  console.log(`   merkleRoot   : ${merkleRoot}`)
  console.log(`   destinataires: ${out.length}`)
  console.log(`   total        : ${total.toString()} base units (${Number(total) / 10 ** USDC_DECIMALS} USDC)`)
  console.log(`   → setMerkleRoot(${merkleRoot})`)
  console.log(`   → fund(${total.toString()})  (après usdc.approve(pool, total))`)
  console.log(`   écrit: ${outPath}`)
}

// ── VERIFY ON-CHAIN : prouve que le contrat déployé ACCEPTE ces preuves ──────
const POOL_ABI = [
  {
    type: 'function',
    name: 'verifyClaim',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'proof', type: 'bytes32[]' },
    ],
    outputs: [{ name: 'isValid', type: 'bool' }],
  },
  { type: 'function', name: 'merkleRoot', stateMutability: 'view', inputs: [], outputs: [{ type: 'bytes32' }] },
] as const

async function verify(outPath: string) {
  const rpc = process.env.RPC_URL
  const pool = process.env.POOL_ADDRESS
  if (!rpc || !pool || !isAddress(pool)) throw new Error('RPC_URL et POOL_ADDRESS (0x…) requis')

  const data = JSON.parse(readFileSync(outPath, 'utf8')) as {
    merkleRoot: `0x${string}`
    entries: OutEntry[]
  }
  const client = createPublicClient({ transport: http(rpc) })

  const onchainRoot = (await client.readContract({
    address: getAddress(pool),
    abi: POOL_ABI,
    functionName: 'merkleRoot',
  })) as `0x${string}`

  if (onchainRoot.toLowerCase() !== data.merkleRoot.toLowerCase()) {
    console.warn(`⚠️  root on-chain (${onchainRoot}) ≠ root du fichier (${data.merkleRoot}).`)
    console.warn('    Appelle setMerkleRoot() avec le root du fichier avant de tester un vrai claim.')
  }

  let ok = 0
  let bad = 0
  for (const e of data.entries) {
    const isValid = await client.readContract({
      address: getAddress(pool),
      abi: POOL_ABI,
      functionName: 'verifyClaim',
      args: [e.address, BigInt(e.amount), e.proof],
    })
    if (isValid) ok++
    else {
      bad++
      console.error(`❌ le contrat REJETTE ${e.address} (${e.amount})`)
    }
  }
  console.log(`\n${bad === 0 ? '✅' : '❌'} VERIFY ON-CHAIN : ${ok} acceptées, ${bad} rejetées`)
  if (bad > 0) process.exit(1)
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const [cmd, a, b] = process.argv.slice(2)
if (cmd === 'build' && a && b) build(a, b)
else if (cmd === 'verify' && a) verify(a)
else {
  console.log('Usage:')
  console.log('  tsx season-merkle.ts build <distribution.json> <out.json>')
  console.log('  RPC_URL=… POOL_ADDRESS=0x… tsx season-merkle.ts verify <out.json>')
  process.exit(1)
}
