// The ONE table page size (founder-approved wireframe 2026-08-02, « ok les
// 2 »): the /admin/members pager, the public /registry pager and the /season
// board pager all import THIS constant — never a re-typed 25 (CLAUDE.md ①,
// the twin search). Public pagers stay DORMANT at or below one page: today's
// 16-seat register and 15-row board render byte-identical to before.
export const TABLE_PAGE_SIZE = 25;
