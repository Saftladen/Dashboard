// only stay here until https://github.com/acarl005/join-monster/pull/292 is resolved

declare module "join-monster" {
  interface DialectModule {
    name: string;
  }

  type Dialect = "pg" | "oracle" | "mariadb" | "mysql" | "sqlite3";
  type JoinMonsterOptions = {minify?: boolean; dialect?: Dialect; dialectModule?: DialectModule};

  type Rows = any;
  type DbCallCallback = (sql: string, done: (err?: any, rows?: Rows) => void) => void;
  type DbCallPromise = (sql: string) => Promise<Rows>;
  type DbCall = DbCallCallback | DbCallPromise;

  function joinMonster(
    resolveInfo: any,
    context: any,
    dbCall: DbCallCallback | DbCallPromise,
    options?: JoinMonsterOptions
  ): Promise<any>;

  export default joinMonster;
}
