
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model College
 * 
 */
export type College = $Result.DefaultSelection<Prisma.$CollegePayload>
/**
 * Model Student
 * 
 */
export type Student = $Result.DefaultSelection<Prisma.$StudentPayload>
/**
 * Model GitHubProfile
 * 
 */
export type GitHubProfile = $Result.DefaultSelection<Prisma.$GitHubProfilePayload>
/**
 * Model DSAProfile
 * 
 */
export type DSAProfile = $Result.DefaultSelection<Prisma.$DSAProfilePayload>
/**
 * Model JRICalculation
 * 
 */
export type JRICalculation = $Result.DefaultSelection<Prisma.$JRICalculationPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  RECRUITER: 'RECRUITER'
};

export type Role = (typeof Role)[keyof typeof Role]


export const FetchStatus: {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

export type FetchStatus = (typeof FetchStatus)[keyof typeof FetchStatus]


export const Platform: {
  LEETCODE: 'LEETCODE',
  CODEFORCES: 'CODEFORCES',
  HACKERRANK: 'HACKERRANK'
};

export type Platform = (typeof Platform)[keyof typeof Platform]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type FetchStatus = $Enums.FetchStatus

export const FetchStatus: typeof $Enums.FetchStatus

export type Platform = $Enums.Platform

export const Platform: typeof $Enums.Platform

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.college`: Exposes CRUD operations for the **College** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Colleges
    * const colleges = await prisma.college.findMany()
    * ```
    */
  get college(): Prisma.CollegeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.student`: Exposes CRUD operations for the **Student** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Students
    * const students = await prisma.student.findMany()
    * ```
    */
  get student(): Prisma.StudentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gitHubProfile`: Exposes CRUD operations for the **GitHubProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GitHubProfiles
    * const gitHubProfiles = await prisma.gitHubProfile.findMany()
    * ```
    */
  get gitHubProfile(): Prisma.GitHubProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dSAProfile`: Exposes CRUD operations for the **DSAProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DSAProfiles
    * const dSAProfiles = await prisma.dSAProfile.findMany()
    * ```
    */
  get dSAProfile(): Prisma.DSAProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.jRICalculation`: Exposes CRUD operations for the **JRICalculation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JRICalculations
    * const jRICalculations = await prisma.jRICalculation.findMany()
    * ```
    */
  get jRICalculation(): Prisma.JRICalculationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.2
   * Query Engine version: 94a226be1cf2967af2541cca5529f0f7ba866919
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    College: 'College',
    Student: 'Student',
    GitHubProfile: 'GitHubProfile',
    DSAProfile: 'DSAProfile',
    JRICalculation: 'JRICalculation'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "college" | "student" | "gitHubProfile" | "dSAProfile" | "jRICalculation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      College: {
        payload: Prisma.$CollegePayload<ExtArgs>
        fields: Prisma.CollegeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CollegeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CollegeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>
          }
          findFirst: {
            args: Prisma.CollegeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CollegeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>
          }
          findMany: {
            args: Prisma.CollegeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>[]
          }
          create: {
            args: Prisma.CollegeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>
          }
          createMany: {
            args: Prisma.CollegeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CollegeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>[]
          }
          delete: {
            args: Prisma.CollegeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>
          }
          update: {
            args: Prisma.CollegeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>
          }
          deleteMany: {
            args: Prisma.CollegeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CollegeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CollegeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>[]
          }
          upsert: {
            args: Prisma.CollegeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CollegePayload>
          }
          aggregate: {
            args: Prisma.CollegeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCollege>
          }
          groupBy: {
            args: Prisma.CollegeGroupByArgs<ExtArgs>
            result: $Utils.Optional<CollegeGroupByOutputType>[]
          }
          count: {
            args: Prisma.CollegeCountArgs<ExtArgs>
            result: $Utils.Optional<CollegeCountAggregateOutputType> | number
          }
        }
      }
      Student: {
        payload: Prisma.$StudentPayload<ExtArgs>
        fields: Prisma.StudentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StudentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StudentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          findFirst: {
            args: Prisma.StudentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StudentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          findMany: {
            args: Prisma.StudentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[]
          }
          create: {
            args: Prisma.StudentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          createMany: {
            args: Prisma.StudentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StudentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[]
          }
          delete: {
            args: Prisma.StudentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          update: {
            args: Prisma.StudentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          deleteMany: {
            args: Prisma.StudentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StudentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StudentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[]
          }
          upsert: {
            args: Prisma.StudentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          aggregate: {
            args: Prisma.StudentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStudent>
          }
          groupBy: {
            args: Prisma.StudentGroupByArgs<ExtArgs>
            result: $Utils.Optional<StudentGroupByOutputType>[]
          }
          count: {
            args: Prisma.StudentCountArgs<ExtArgs>
            result: $Utils.Optional<StudentCountAggregateOutputType> | number
          }
        }
      }
      GitHubProfile: {
        payload: Prisma.$GitHubProfilePayload<ExtArgs>
        fields: Prisma.GitHubProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GitHubProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GitHubProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>
          }
          findFirst: {
            args: Prisma.GitHubProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GitHubProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>
          }
          findMany: {
            args: Prisma.GitHubProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>[]
          }
          create: {
            args: Prisma.GitHubProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>
          }
          createMany: {
            args: Prisma.GitHubProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GitHubProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>[]
          }
          delete: {
            args: Prisma.GitHubProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>
          }
          update: {
            args: Prisma.GitHubProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>
          }
          deleteMany: {
            args: Prisma.GitHubProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GitHubProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GitHubProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>[]
          }
          upsert: {
            args: Prisma.GitHubProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GitHubProfilePayload>
          }
          aggregate: {
            args: Prisma.GitHubProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGitHubProfile>
          }
          groupBy: {
            args: Prisma.GitHubProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<GitHubProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.GitHubProfileCountArgs<ExtArgs>
            result: $Utils.Optional<GitHubProfileCountAggregateOutputType> | number
          }
        }
      }
      DSAProfile: {
        payload: Prisma.$DSAProfilePayload<ExtArgs>
        fields: Prisma.DSAProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DSAProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DSAProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>
          }
          findFirst: {
            args: Prisma.DSAProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DSAProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>
          }
          findMany: {
            args: Prisma.DSAProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>[]
          }
          create: {
            args: Prisma.DSAProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>
          }
          createMany: {
            args: Prisma.DSAProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DSAProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>[]
          }
          delete: {
            args: Prisma.DSAProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>
          }
          update: {
            args: Prisma.DSAProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>
          }
          deleteMany: {
            args: Prisma.DSAProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DSAProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DSAProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>[]
          }
          upsert: {
            args: Prisma.DSAProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DSAProfilePayload>
          }
          aggregate: {
            args: Prisma.DSAProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDSAProfile>
          }
          groupBy: {
            args: Prisma.DSAProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<DSAProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.DSAProfileCountArgs<ExtArgs>
            result: $Utils.Optional<DSAProfileCountAggregateOutputType> | number
          }
        }
      }
      JRICalculation: {
        payload: Prisma.$JRICalculationPayload<ExtArgs>
        fields: Prisma.JRICalculationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JRICalculationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JRICalculationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>
          }
          findFirst: {
            args: Prisma.JRICalculationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JRICalculationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>
          }
          findMany: {
            args: Prisma.JRICalculationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>[]
          }
          create: {
            args: Prisma.JRICalculationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>
          }
          createMany: {
            args: Prisma.JRICalculationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JRICalculationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>[]
          }
          delete: {
            args: Prisma.JRICalculationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>
          }
          update: {
            args: Prisma.JRICalculationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>
          }
          deleteMany: {
            args: Prisma.JRICalculationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JRICalculationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.JRICalculationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>[]
          }
          upsert: {
            args: Prisma.JRICalculationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JRICalculationPayload>
          }
          aggregate: {
            args: Prisma.JRICalculationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJRICalculation>
          }
          groupBy: {
            args: Prisma.JRICalculationGroupByArgs<ExtArgs>
            result: $Utils.Optional<JRICalculationGroupByOutputType>[]
          }
          count: {
            args: Prisma.JRICalculationCountArgs<ExtArgs>
            result: $Utils.Optional<JRICalculationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    college?: CollegeOmit
    student?: StudentOmit
    gitHubProfile?: GitHubProfileOmit
    dSAProfile?: DSAProfileOmit
    jRICalculation?: JRICalculationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CollegeCountOutputType
   */

  export type CollegeCountOutputType = {
    students: number
    users: number
  }

  export type CollegeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    students?: boolean | CollegeCountOutputTypeCountStudentsArgs
    users?: boolean | CollegeCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * CollegeCountOutputType without action
   */
  export type CollegeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CollegeCountOutputType
     */
    select?: CollegeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CollegeCountOutputType without action
   */
  export type CollegeCountOutputTypeCountStudentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StudentWhereInput
  }

  /**
   * CollegeCountOutputType without action
   */
  export type CollegeCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type StudentCountOutputType
   */

  export type StudentCountOutputType = {
    dsaProfiles: number
    jriCalculations: number
  }

  export type StudentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    dsaProfiles?: boolean | StudentCountOutputTypeCountDsaProfilesArgs
    jriCalculations?: boolean | StudentCountOutputTypeCountJriCalculationsArgs
  }

  // Custom InputTypes
  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StudentCountOutputType
     */
    select?: StudentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeCountDsaProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DSAProfileWhereInput
  }

  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeCountJriCalculationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JRICalculationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: $Enums.Role | null
    isActive: boolean | null
    collegeId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: $Enums.Role | null
    isActive: boolean | null
    collegeId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    role: number
    isActive: number
    collegeId: number
    createdAt: number
    updatedAt: number
    lastLoginAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    isActive?: true
    collegeId?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    isActive?: true
    collegeId?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    isActive?: true
    collegeId?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    role: $Enums.Role
    isActive: boolean
    collegeId: string | null
    createdAt: Date
    updatedAt: Date
    lastLoginAt: Date | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    isActive?: boolean
    collegeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    college?: boolean | User$collegeArgs<ExtArgs>
    student?: boolean | User$studentArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    isActive?: boolean
    collegeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    college?: boolean | User$collegeArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    isActive?: boolean
    collegeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    college?: boolean | User$collegeArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    isActive?: boolean
    collegeId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "role" | "isActive" | "collegeId" | "createdAt" | "updatedAt" | "lastLoginAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    college?: boolean | User$collegeArgs<ExtArgs>
    student?: boolean | User$studentArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    college?: boolean | User$collegeArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    college?: boolean | User$collegeArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      college: Prisma.$CollegePayload<ExtArgs> | null
      student: Prisma.$StudentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      role: $Enums.Role
      isActive: boolean
      collegeId: string | null
      createdAt: Date
      updatedAt: Date
      lastLoginAt: Date | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    college<T extends User$collegeArgs<ExtArgs> = {}>(args?: Subset<T, User$collegeArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    student<T extends User$studentArgs<ExtArgs> = {}>(args?: Subset<T, User$studentArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly collegeId: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly lastLoginAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.college
   */
  export type User$collegeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    where?: CollegeWhereInput
  }

  /**
   * User.student
   */
  export type User$studentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    where?: StudentWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model College
   */

  export type AggregateCollege = {
    _count: CollegeCountAggregateOutputType | null
    _min: CollegeMinAggregateOutputType | null
    _max: CollegeMaxAggregateOutputType | null
  }

  export type CollegeMinAggregateOutputType = {
    id: string | null
    name: string | null
    shortName: string | null
    domain: string | null
    location: string | null
    website: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CollegeMaxAggregateOutputType = {
    id: string | null
    name: string | null
    shortName: string | null
    domain: string | null
    location: string | null
    website: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CollegeCountAggregateOutputType = {
    id: number
    name: number
    shortName: number
    domain: number
    location: number
    website: number
    settings: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CollegeMinAggregateInputType = {
    id?: true
    name?: true
    shortName?: true
    domain?: true
    location?: true
    website?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CollegeMaxAggregateInputType = {
    id?: true
    name?: true
    shortName?: true
    domain?: true
    location?: true
    website?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CollegeCountAggregateInputType = {
    id?: true
    name?: true
    shortName?: true
    domain?: true
    location?: true
    website?: true
    settings?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CollegeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which College to aggregate.
     */
    where?: CollegeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colleges to fetch.
     */
    orderBy?: CollegeOrderByWithRelationInput | CollegeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CollegeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colleges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colleges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Colleges
    **/
    _count?: true | CollegeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CollegeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CollegeMaxAggregateInputType
  }

  export type GetCollegeAggregateType<T extends CollegeAggregateArgs> = {
        [P in keyof T & keyof AggregateCollege]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCollege[P]>
      : GetScalarType<T[P], AggregateCollege[P]>
  }




  export type CollegeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CollegeWhereInput
    orderBy?: CollegeOrderByWithAggregationInput | CollegeOrderByWithAggregationInput[]
    by: CollegeScalarFieldEnum[] | CollegeScalarFieldEnum
    having?: CollegeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CollegeCountAggregateInputType | true
    _min?: CollegeMinAggregateInputType
    _max?: CollegeMaxAggregateInputType
  }

  export type CollegeGroupByOutputType = {
    id: string
    name: string
    shortName: string
    domain: string | null
    location: string | null
    website: string | null
    settings: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: CollegeCountAggregateOutputType | null
    _min: CollegeMinAggregateOutputType | null
    _max: CollegeMaxAggregateOutputType | null
  }

  type GetCollegeGroupByPayload<T extends CollegeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CollegeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CollegeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CollegeGroupByOutputType[P]>
            : GetScalarType<T[P], CollegeGroupByOutputType[P]>
        }
      >
    >


  export type CollegeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    shortName?: boolean
    domain?: boolean
    location?: boolean
    website?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    students?: boolean | College$studentsArgs<ExtArgs>
    users?: boolean | College$usersArgs<ExtArgs>
    _count?: boolean | CollegeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["college"]>

  export type CollegeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    shortName?: boolean
    domain?: boolean
    location?: boolean
    website?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["college"]>

  export type CollegeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    shortName?: boolean
    domain?: boolean
    location?: boolean
    website?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["college"]>

  export type CollegeSelectScalar = {
    id?: boolean
    name?: boolean
    shortName?: boolean
    domain?: boolean
    location?: boolean
    website?: boolean
    settings?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CollegeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "shortName" | "domain" | "location" | "website" | "settings" | "createdAt" | "updatedAt", ExtArgs["result"]["college"]>
  export type CollegeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    students?: boolean | College$studentsArgs<ExtArgs>
    users?: boolean | College$usersArgs<ExtArgs>
    _count?: boolean | CollegeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CollegeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CollegeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CollegePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "College"
    objects: {
      students: Prisma.$StudentPayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      shortName: string
      domain: string | null
      location: string | null
      website: string | null
      settings: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["college"]>
    composites: {}
  }

  type CollegeGetPayload<S extends boolean | null | undefined | CollegeDefaultArgs> = $Result.GetResult<Prisma.$CollegePayload, S>

  type CollegeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CollegeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CollegeCountAggregateInputType | true
    }

  export interface CollegeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['College'], meta: { name: 'College' } }
    /**
     * Find zero or one College that matches the filter.
     * @param {CollegeFindUniqueArgs} args - Arguments to find a College
     * @example
     * // Get one College
     * const college = await prisma.college.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CollegeFindUniqueArgs>(args: SelectSubset<T, CollegeFindUniqueArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one College that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CollegeFindUniqueOrThrowArgs} args - Arguments to find a College
     * @example
     * // Get one College
     * const college = await prisma.college.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CollegeFindUniqueOrThrowArgs>(args: SelectSubset<T, CollegeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first College that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollegeFindFirstArgs} args - Arguments to find a College
     * @example
     * // Get one College
     * const college = await prisma.college.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CollegeFindFirstArgs>(args?: SelectSubset<T, CollegeFindFirstArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first College that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollegeFindFirstOrThrowArgs} args - Arguments to find a College
     * @example
     * // Get one College
     * const college = await prisma.college.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CollegeFindFirstOrThrowArgs>(args?: SelectSubset<T, CollegeFindFirstOrThrowArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Colleges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollegeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Colleges
     * const colleges = await prisma.college.findMany()
     * 
     * // Get first 10 Colleges
     * const colleges = await prisma.college.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const collegeWithIdOnly = await prisma.college.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CollegeFindManyArgs>(args?: SelectSubset<T, CollegeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a College.
     * @param {CollegeCreateArgs} args - Arguments to create a College.
     * @example
     * // Create one College
     * const College = await prisma.college.create({
     *   data: {
     *     // ... data to create a College
     *   }
     * })
     * 
     */
    create<T extends CollegeCreateArgs>(args: SelectSubset<T, CollegeCreateArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Colleges.
     * @param {CollegeCreateManyArgs} args - Arguments to create many Colleges.
     * @example
     * // Create many Colleges
     * const college = await prisma.college.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CollegeCreateManyArgs>(args?: SelectSubset<T, CollegeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Colleges and returns the data saved in the database.
     * @param {CollegeCreateManyAndReturnArgs} args - Arguments to create many Colleges.
     * @example
     * // Create many Colleges
     * const college = await prisma.college.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Colleges and only return the `id`
     * const collegeWithIdOnly = await prisma.college.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CollegeCreateManyAndReturnArgs>(args?: SelectSubset<T, CollegeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a College.
     * @param {CollegeDeleteArgs} args - Arguments to delete one College.
     * @example
     * // Delete one College
     * const College = await prisma.college.delete({
     *   where: {
     *     // ... filter to delete one College
     *   }
     * })
     * 
     */
    delete<T extends CollegeDeleteArgs>(args: SelectSubset<T, CollegeDeleteArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one College.
     * @param {CollegeUpdateArgs} args - Arguments to update one College.
     * @example
     * // Update one College
     * const college = await prisma.college.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CollegeUpdateArgs>(args: SelectSubset<T, CollegeUpdateArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Colleges.
     * @param {CollegeDeleteManyArgs} args - Arguments to filter Colleges to delete.
     * @example
     * // Delete a few Colleges
     * const { count } = await prisma.college.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CollegeDeleteManyArgs>(args?: SelectSubset<T, CollegeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Colleges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollegeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Colleges
     * const college = await prisma.college.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CollegeUpdateManyArgs>(args: SelectSubset<T, CollegeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Colleges and returns the data updated in the database.
     * @param {CollegeUpdateManyAndReturnArgs} args - Arguments to update many Colleges.
     * @example
     * // Update many Colleges
     * const college = await prisma.college.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Colleges and only return the `id`
     * const collegeWithIdOnly = await prisma.college.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CollegeUpdateManyAndReturnArgs>(args: SelectSubset<T, CollegeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one College.
     * @param {CollegeUpsertArgs} args - Arguments to update or create a College.
     * @example
     * // Update or create a College
     * const college = await prisma.college.upsert({
     *   create: {
     *     // ... data to create a College
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the College we want to update
     *   }
     * })
     */
    upsert<T extends CollegeUpsertArgs>(args: SelectSubset<T, CollegeUpsertArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Colleges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollegeCountArgs} args - Arguments to filter Colleges to count.
     * @example
     * // Count the number of Colleges
     * const count = await prisma.college.count({
     *   where: {
     *     // ... the filter for the Colleges we want to count
     *   }
     * })
    **/
    count<T extends CollegeCountArgs>(
      args?: Subset<T, CollegeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CollegeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a College.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollegeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CollegeAggregateArgs>(args: Subset<T, CollegeAggregateArgs>): Prisma.PrismaPromise<GetCollegeAggregateType<T>>

    /**
     * Group by College.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CollegeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CollegeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CollegeGroupByArgs['orderBy'] }
        : { orderBy?: CollegeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CollegeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCollegeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the College model
   */
  readonly fields: CollegeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for College.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CollegeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    students<T extends College$studentsArgs<ExtArgs> = {}>(args?: Subset<T, College$studentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends College$usersArgs<ExtArgs> = {}>(args?: Subset<T, College$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the College model
   */
  interface CollegeFieldRefs {
    readonly id: FieldRef<"College", 'String'>
    readonly name: FieldRef<"College", 'String'>
    readonly shortName: FieldRef<"College", 'String'>
    readonly domain: FieldRef<"College", 'String'>
    readonly location: FieldRef<"College", 'String'>
    readonly website: FieldRef<"College", 'String'>
    readonly settings: FieldRef<"College", 'Json'>
    readonly createdAt: FieldRef<"College", 'DateTime'>
    readonly updatedAt: FieldRef<"College", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * College findUnique
   */
  export type CollegeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * Filter, which College to fetch.
     */
    where: CollegeWhereUniqueInput
  }

  /**
   * College findUniqueOrThrow
   */
  export type CollegeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * Filter, which College to fetch.
     */
    where: CollegeWhereUniqueInput
  }

  /**
   * College findFirst
   */
  export type CollegeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * Filter, which College to fetch.
     */
    where?: CollegeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colleges to fetch.
     */
    orderBy?: CollegeOrderByWithRelationInput | CollegeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Colleges.
     */
    cursor?: CollegeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colleges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colleges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Colleges.
     */
    distinct?: CollegeScalarFieldEnum | CollegeScalarFieldEnum[]
  }

  /**
   * College findFirstOrThrow
   */
  export type CollegeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * Filter, which College to fetch.
     */
    where?: CollegeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colleges to fetch.
     */
    orderBy?: CollegeOrderByWithRelationInput | CollegeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Colleges.
     */
    cursor?: CollegeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colleges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colleges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Colleges.
     */
    distinct?: CollegeScalarFieldEnum | CollegeScalarFieldEnum[]
  }

  /**
   * College findMany
   */
  export type CollegeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * Filter, which Colleges to fetch.
     */
    where?: CollegeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colleges to fetch.
     */
    orderBy?: CollegeOrderByWithRelationInput | CollegeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Colleges.
     */
    cursor?: CollegeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colleges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colleges.
     */
    skip?: number
    distinct?: CollegeScalarFieldEnum | CollegeScalarFieldEnum[]
  }

  /**
   * College create
   */
  export type CollegeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * The data needed to create a College.
     */
    data: XOR<CollegeCreateInput, CollegeUncheckedCreateInput>
  }

  /**
   * College createMany
   */
  export type CollegeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Colleges.
     */
    data: CollegeCreateManyInput | CollegeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * College createManyAndReturn
   */
  export type CollegeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * The data used to create many Colleges.
     */
    data: CollegeCreateManyInput | CollegeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * College update
   */
  export type CollegeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * The data needed to update a College.
     */
    data: XOR<CollegeUpdateInput, CollegeUncheckedUpdateInput>
    /**
     * Choose, which College to update.
     */
    where: CollegeWhereUniqueInput
  }

  /**
   * College updateMany
   */
  export type CollegeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Colleges.
     */
    data: XOR<CollegeUpdateManyMutationInput, CollegeUncheckedUpdateManyInput>
    /**
     * Filter which Colleges to update
     */
    where?: CollegeWhereInput
    /**
     * Limit how many Colleges to update.
     */
    limit?: number
  }

  /**
   * College updateManyAndReturn
   */
  export type CollegeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * The data used to update Colleges.
     */
    data: XOR<CollegeUpdateManyMutationInput, CollegeUncheckedUpdateManyInput>
    /**
     * Filter which Colleges to update
     */
    where?: CollegeWhereInput
    /**
     * Limit how many Colleges to update.
     */
    limit?: number
  }

  /**
   * College upsert
   */
  export type CollegeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * The filter to search for the College to update in case it exists.
     */
    where: CollegeWhereUniqueInput
    /**
     * In case the College found by the `where` argument doesn't exist, create a new College with this data.
     */
    create: XOR<CollegeCreateInput, CollegeUncheckedCreateInput>
    /**
     * In case the College was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CollegeUpdateInput, CollegeUncheckedUpdateInput>
  }

  /**
   * College delete
   */
  export type CollegeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    /**
     * Filter which College to delete.
     */
    where: CollegeWhereUniqueInput
  }

  /**
   * College deleteMany
   */
  export type CollegeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Colleges to delete
     */
    where?: CollegeWhereInput
    /**
     * Limit how many Colleges to delete.
     */
    limit?: number
  }

  /**
   * College.students
   */
  export type College$studentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    where?: StudentWhereInput
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    cursor?: StudentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * College.users
   */
  export type College$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * College without action
   */
  export type CollegeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
  }


  /**
   * Model Student
   */

  export type AggregateStudent = {
    _count: StudentCountAggregateOutputType | null
    _avg: StudentAvgAggregateOutputType | null
    _sum: StudentSumAggregateOutputType | null
    _min: StudentMinAggregateOutputType | null
    _max: StudentMaxAggregateOutputType | null
  }

  export type StudentAvgAggregateOutputType = {
    semester: number | null
    placementYear: number | null
    packageOffered: number | null
  }

  export type StudentSumAggregateOutputType = {
    semester: number | null
    placementYear: number | null
    packageOffered: number | null
  }

  export type StudentMinAggregateOutputType = {
    id: string | null
    userId: string | null
    collegeId: string | null
    firstName: string | null
    lastName: string | null
    rollNumber: string | null
    email: string | null
    phone: string | null
    department: string | null
    semester: number | null
    batch: string | null
    section: string | null
    isPlaced: boolean | null
    placementYear: number | null
    packageOffered: number | null
    companyName: string | null
    githubUsername: string | null
    githubAccessToken: string | null
    githubConnectedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StudentMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    collegeId: string | null
    firstName: string | null
    lastName: string | null
    rollNumber: string | null
    email: string | null
    phone: string | null
    department: string | null
    semester: number | null
    batch: string | null
    section: string | null
    isPlaced: boolean | null
    placementYear: number | null
    packageOffered: number | null
    companyName: string | null
    githubUsername: string | null
    githubAccessToken: string | null
    githubConnectedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StudentCountAggregateOutputType = {
    id: number
    userId: number
    collegeId: number
    firstName: number
    lastName: number
    rollNumber: number
    email: number
    phone: number
    department: number
    semester: number
    batch: number
    section: number
    isPlaced: number
    placementYear: number
    packageOffered: number
    companyName: number
    githubUsername: number
    githubAccessToken: number
    githubConnectedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StudentAvgAggregateInputType = {
    semester?: true
    placementYear?: true
    packageOffered?: true
  }

  export type StudentSumAggregateInputType = {
    semester?: true
    placementYear?: true
    packageOffered?: true
  }

  export type StudentMinAggregateInputType = {
    id?: true
    userId?: true
    collegeId?: true
    firstName?: true
    lastName?: true
    rollNumber?: true
    email?: true
    phone?: true
    department?: true
    semester?: true
    batch?: true
    section?: true
    isPlaced?: true
    placementYear?: true
    packageOffered?: true
    companyName?: true
    githubUsername?: true
    githubAccessToken?: true
    githubConnectedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StudentMaxAggregateInputType = {
    id?: true
    userId?: true
    collegeId?: true
    firstName?: true
    lastName?: true
    rollNumber?: true
    email?: true
    phone?: true
    department?: true
    semester?: true
    batch?: true
    section?: true
    isPlaced?: true
    placementYear?: true
    packageOffered?: true
    companyName?: true
    githubUsername?: true
    githubAccessToken?: true
    githubConnectedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StudentCountAggregateInputType = {
    id?: true
    userId?: true
    collegeId?: true
    firstName?: true
    lastName?: true
    rollNumber?: true
    email?: true
    phone?: true
    department?: true
    semester?: true
    batch?: true
    section?: true
    isPlaced?: true
    placementYear?: true
    packageOffered?: true
    companyName?: true
    githubUsername?: true
    githubAccessToken?: true
    githubConnectedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StudentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Student to aggregate.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Students
    **/
    _count?: true | StudentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StudentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StudentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StudentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StudentMaxAggregateInputType
  }

  export type GetStudentAggregateType<T extends StudentAggregateArgs> = {
        [P in keyof T & keyof AggregateStudent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStudent[P]>
      : GetScalarType<T[P], AggregateStudent[P]>
  }




  export type StudentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StudentWhereInput
    orderBy?: StudentOrderByWithAggregationInput | StudentOrderByWithAggregationInput[]
    by: StudentScalarFieldEnum[] | StudentScalarFieldEnum
    having?: StudentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StudentCountAggregateInputType | true
    _avg?: StudentAvgAggregateInputType
    _sum?: StudentSumAggregateInputType
    _min?: StudentMinAggregateInputType
    _max?: StudentMaxAggregateInputType
  }

  export type StudentGroupByOutputType = {
    id: string
    userId: string
    collegeId: string | null
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone: string | null
    department: string
    semester: number
    batch: string
    section: string | null
    isPlaced: boolean
    placementYear: number | null
    packageOffered: number | null
    companyName: string | null
    githubUsername: string | null
    githubAccessToken: string | null
    githubConnectedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: StudentCountAggregateOutputType | null
    _avg: StudentAvgAggregateOutputType | null
    _sum: StudentSumAggregateOutputType | null
    _min: StudentMinAggregateOutputType | null
    _max: StudentMaxAggregateOutputType | null
  }

  type GetStudentGroupByPayload<T extends StudentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StudentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StudentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StudentGroupByOutputType[P]>
            : GetScalarType<T[P], StudentGroupByOutputType[P]>
        }
      >
    >


  export type StudentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    collegeId?: boolean
    firstName?: boolean
    lastName?: boolean
    rollNumber?: boolean
    email?: boolean
    phone?: boolean
    department?: boolean
    semester?: boolean
    batch?: boolean
    section?: boolean
    isPlaced?: boolean
    placementYear?: boolean
    packageOffered?: boolean
    companyName?: boolean
    githubUsername?: boolean
    githubAccessToken?: boolean
    githubConnectedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    college?: boolean | Student$collegeArgs<ExtArgs>
    githubProfile?: boolean | Student$githubProfileArgs<ExtArgs>
    dsaProfiles?: boolean | Student$dsaProfilesArgs<ExtArgs>
    jriCalculations?: boolean | Student$jriCalculationsArgs<ExtArgs>
    _count?: boolean | StudentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["student"]>

  export type StudentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    collegeId?: boolean
    firstName?: boolean
    lastName?: boolean
    rollNumber?: boolean
    email?: boolean
    phone?: boolean
    department?: boolean
    semester?: boolean
    batch?: boolean
    section?: boolean
    isPlaced?: boolean
    placementYear?: boolean
    packageOffered?: boolean
    companyName?: boolean
    githubUsername?: boolean
    githubAccessToken?: boolean
    githubConnectedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    college?: boolean | Student$collegeArgs<ExtArgs>
  }, ExtArgs["result"]["student"]>

  export type StudentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    collegeId?: boolean
    firstName?: boolean
    lastName?: boolean
    rollNumber?: boolean
    email?: boolean
    phone?: boolean
    department?: boolean
    semester?: boolean
    batch?: boolean
    section?: boolean
    isPlaced?: boolean
    placementYear?: boolean
    packageOffered?: boolean
    companyName?: boolean
    githubUsername?: boolean
    githubAccessToken?: boolean
    githubConnectedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    college?: boolean | Student$collegeArgs<ExtArgs>
  }, ExtArgs["result"]["student"]>

  export type StudentSelectScalar = {
    id?: boolean
    userId?: boolean
    collegeId?: boolean
    firstName?: boolean
    lastName?: boolean
    rollNumber?: boolean
    email?: boolean
    phone?: boolean
    department?: boolean
    semester?: boolean
    batch?: boolean
    section?: boolean
    isPlaced?: boolean
    placementYear?: boolean
    packageOffered?: boolean
    companyName?: boolean
    githubUsername?: boolean
    githubAccessToken?: boolean
    githubConnectedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StudentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "collegeId" | "firstName" | "lastName" | "rollNumber" | "email" | "phone" | "department" | "semester" | "batch" | "section" | "isPlaced" | "placementYear" | "packageOffered" | "companyName" | "githubUsername" | "githubAccessToken" | "githubConnectedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["student"]>
  export type StudentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    college?: boolean | Student$collegeArgs<ExtArgs>
    githubProfile?: boolean | Student$githubProfileArgs<ExtArgs>
    dsaProfiles?: boolean | Student$dsaProfilesArgs<ExtArgs>
    jriCalculations?: boolean | Student$jriCalculationsArgs<ExtArgs>
    _count?: boolean | StudentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StudentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    college?: boolean | Student$collegeArgs<ExtArgs>
  }
  export type StudentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    college?: boolean | Student$collegeArgs<ExtArgs>
  }

  export type $StudentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Student"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      college: Prisma.$CollegePayload<ExtArgs> | null
      githubProfile: Prisma.$GitHubProfilePayload<ExtArgs> | null
      dsaProfiles: Prisma.$DSAProfilePayload<ExtArgs>[]
      jriCalculations: Prisma.$JRICalculationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      collegeId: string | null
      firstName: string
      lastName: string
      rollNumber: string
      email: string
      phone: string | null
      department: string
      semester: number
      batch: string
      section: string | null
      isPlaced: boolean
      placementYear: number | null
      packageOffered: number | null
      companyName: string | null
      githubUsername: string | null
      githubAccessToken: string | null
      githubConnectedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["student"]>
    composites: {}
  }

  type StudentGetPayload<S extends boolean | null | undefined | StudentDefaultArgs> = $Result.GetResult<Prisma.$StudentPayload, S>

  type StudentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StudentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StudentCountAggregateInputType | true
    }

  export interface StudentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Student'], meta: { name: 'Student' } }
    /**
     * Find zero or one Student that matches the filter.
     * @param {StudentFindUniqueArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StudentFindUniqueArgs>(args: SelectSubset<T, StudentFindUniqueArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Student that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StudentFindUniqueOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StudentFindUniqueOrThrowArgs>(args: SelectSubset<T, StudentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Student that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StudentFindFirstArgs>(args?: SelectSubset<T, StudentFindFirstArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Student that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StudentFindFirstOrThrowArgs>(args?: SelectSubset<T, StudentFindFirstOrThrowArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Students that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Students
     * const students = await prisma.student.findMany()
     * 
     * // Get first 10 Students
     * const students = await prisma.student.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const studentWithIdOnly = await prisma.student.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StudentFindManyArgs>(args?: SelectSubset<T, StudentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Student.
     * @param {StudentCreateArgs} args - Arguments to create a Student.
     * @example
     * // Create one Student
     * const Student = await prisma.student.create({
     *   data: {
     *     // ... data to create a Student
     *   }
     * })
     * 
     */
    create<T extends StudentCreateArgs>(args: SelectSubset<T, StudentCreateArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Students.
     * @param {StudentCreateManyArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StudentCreateManyArgs>(args?: SelectSubset<T, StudentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Students and returns the data saved in the database.
     * @param {StudentCreateManyAndReturnArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Students and only return the `id`
     * const studentWithIdOnly = await prisma.student.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StudentCreateManyAndReturnArgs>(args?: SelectSubset<T, StudentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Student.
     * @param {StudentDeleteArgs} args - Arguments to delete one Student.
     * @example
     * // Delete one Student
     * const Student = await prisma.student.delete({
     *   where: {
     *     // ... filter to delete one Student
     *   }
     * })
     * 
     */
    delete<T extends StudentDeleteArgs>(args: SelectSubset<T, StudentDeleteArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Student.
     * @param {StudentUpdateArgs} args - Arguments to update one Student.
     * @example
     * // Update one Student
     * const student = await prisma.student.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StudentUpdateArgs>(args: SelectSubset<T, StudentUpdateArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Students.
     * @param {StudentDeleteManyArgs} args - Arguments to filter Students to delete.
     * @example
     * // Delete a few Students
     * const { count } = await prisma.student.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StudentDeleteManyArgs>(args?: SelectSubset<T, StudentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Students
     * const student = await prisma.student.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StudentUpdateManyArgs>(args: SelectSubset<T, StudentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Students and returns the data updated in the database.
     * @param {StudentUpdateManyAndReturnArgs} args - Arguments to update many Students.
     * @example
     * // Update many Students
     * const student = await prisma.student.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Students and only return the `id`
     * const studentWithIdOnly = await prisma.student.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StudentUpdateManyAndReturnArgs>(args: SelectSubset<T, StudentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Student.
     * @param {StudentUpsertArgs} args - Arguments to update or create a Student.
     * @example
     * // Update or create a Student
     * const student = await prisma.student.upsert({
     *   create: {
     *     // ... data to create a Student
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Student we want to update
     *   }
     * })
     */
    upsert<T extends StudentUpsertArgs>(args: SelectSubset<T, StudentUpsertArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentCountArgs} args - Arguments to filter Students to count.
     * @example
     * // Count the number of Students
     * const count = await prisma.student.count({
     *   where: {
     *     // ... the filter for the Students we want to count
     *   }
     * })
    **/
    count<T extends StudentCountArgs>(
      args?: Subset<T, StudentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StudentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StudentAggregateArgs>(args: Subset<T, StudentAggregateArgs>): Prisma.PrismaPromise<GetStudentAggregateType<T>>

    /**
     * Group by Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StudentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StudentGroupByArgs['orderBy'] }
        : { orderBy?: StudentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StudentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStudentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Student model
   */
  readonly fields: StudentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Student.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StudentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    college<T extends Student$collegeArgs<ExtArgs> = {}>(args?: Subset<T, Student$collegeArgs<ExtArgs>>): Prisma__CollegeClient<$Result.GetResult<Prisma.$CollegePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    githubProfile<T extends Student$githubProfileArgs<ExtArgs> = {}>(args?: Subset<T, Student$githubProfileArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    dsaProfiles<T extends Student$dsaProfilesArgs<ExtArgs> = {}>(args?: Subset<T, Student$dsaProfilesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    jriCalculations<T extends Student$jriCalculationsArgs<ExtArgs> = {}>(args?: Subset<T, Student$jriCalculationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Student model
   */
  interface StudentFieldRefs {
    readonly id: FieldRef<"Student", 'String'>
    readonly userId: FieldRef<"Student", 'String'>
    readonly collegeId: FieldRef<"Student", 'String'>
    readonly firstName: FieldRef<"Student", 'String'>
    readonly lastName: FieldRef<"Student", 'String'>
    readonly rollNumber: FieldRef<"Student", 'String'>
    readonly email: FieldRef<"Student", 'String'>
    readonly phone: FieldRef<"Student", 'String'>
    readonly department: FieldRef<"Student", 'String'>
    readonly semester: FieldRef<"Student", 'Int'>
    readonly batch: FieldRef<"Student", 'String'>
    readonly section: FieldRef<"Student", 'String'>
    readonly isPlaced: FieldRef<"Student", 'Boolean'>
    readonly placementYear: FieldRef<"Student", 'Int'>
    readonly packageOffered: FieldRef<"Student", 'Float'>
    readonly companyName: FieldRef<"Student", 'String'>
    readonly githubUsername: FieldRef<"Student", 'String'>
    readonly githubAccessToken: FieldRef<"Student", 'String'>
    readonly githubConnectedAt: FieldRef<"Student", 'DateTime'>
    readonly createdAt: FieldRef<"Student", 'DateTime'>
    readonly updatedAt: FieldRef<"Student", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Student findUnique
   */
  export type StudentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student findUniqueOrThrow
   */
  export type StudentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student findFirst
   */
  export type StudentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student findFirstOrThrow
   */
  export type StudentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student findMany
   */
  export type StudentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Students to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student create
   */
  export type StudentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * The data needed to create a Student.
     */
    data: XOR<StudentCreateInput, StudentUncheckedCreateInput>
  }

  /**
   * Student createMany
   */
  export type StudentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Student createManyAndReturn
   */
  export type StudentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Student update
   */
  export type StudentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * The data needed to update a Student.
     */
    data: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>
    /**
     * Choose, which Student to update.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student updateMany
   */
  export type StudentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Students.
     */
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyInput>
    /**
     * Filter which Students to update
     */
    where?: StudentWhereInput
    /**
     * Limit how many Students to update.
     */
    limit?: number
  }

  /**
   * Student updateManyAndReturn
   */
  export type StudentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * The data used to update Students.
     */
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyInput>
    /**
     * Filter which Students to update
     */
    where?: StudentWhereInput
    /**
     * Limit how many Students to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Student upsert
   */
  export type StudentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * The filter to search for the Student to update in case it exists.
     */
    where: StudentWhereUniqueInput
    /**
     * In case the Student found by the `where` argument doesn't exist, create a new Student with this data.
     */
    create: XOR<StudentCreateInput, StudentUncheckedCreateInput>
    /**
     * In case the Student was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>
  }

  /**
   * Student delete
   */
  export type StudentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter which Student to delete.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student deleteMany
   */
  export type StudentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Students to delete
     */
    where?: StudentWhereInput
    /**
     * Limit how many Students to delete.
     */
    limit?: number
  }

  /**
   * Student.college
   */
  export type Student$collegeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the College
     */
    select?: CollegeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the College
     */
    omit?: CollegeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CollegeInclude<ExtArgs> | null
    where?: CollegeWhereInput
  }

  /**
   * Student.githubProfile
   */
  export type Student$githubProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    where?: GitHubProfileWhereInput
  }

  /**
   * Student.dsaProfiles
   */
  export type Student$dsaProfilesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    where?: DSAProfileWhereInput
    orderBy?: DSAProfileOrderByWithRelationInput | DSAProfileOrderByWithRelationInput[]
    cursor?: DSAProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DSAProfileScalarFieldEnum | DSAProfileScalarFieldEnum[]
  }

  /**
   * Student.jriCalculations
   */
  export type Student$jriCalculationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    where?: JRICalculationWhereInput
    orderBy?: JRICalculationOrderByWithRelationInput | JRICalculationOrderByWithRelationInput[]
    cursor?: JRICalculationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: JRICalculationScalarFieldEnum | JRICalculationScalarFieldEnum[]
  }

  /**
   * Student without action
   */
  export type StudentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Student
     */
    omit?: StudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
  }


  /**
   * Model GitHubProfile
   */

  export type AggregateGitHubProfile = {
    _count: GitHubProfileCountAggregateOutputType | null
    _avg: GitHubProfileAvgAggregateOutputType | null
    _sum: GitHubProfileSumAggregateOutputType | null
    _min: GitHubProfileMinAggregateOutputType | null
    _max: GitHubProfileMaxAggregateOutputType | null
  }

  export type GitHubProfileAvgAggregateOutputType = {
    totalRepos: number | null
    totalCommits: number | null
    totalStars: number | null
    totalForks: number | null
  }

  export type GitHubProfileSumAggregateOutputType = {
    totalRepos: number | null
    totalCommits: number | null
    totalStars: number | null
    totalForks: number | null
  }

  export type GitHubProfileMinAggregateOutputType = {
    id: string | null
    studentId: string | null
    username: string | null
    profileUrl: string | null
    totalRepos: number | null
    totalCommits: number | null
    totalStars: number | null
    totalForks: number | null
    lastFetchedAt: Date | null
    fetchStatus: $Enums.FetchStatus | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GitHubProfileMaxAggregateOutputType = {
    id: string | null
    studentId: string | null
    username: string | null
    profileUrl: string | null
    totalRepos: number | null
    totalCommits: number | null
    totalStars: number | null
    totalForks: number | null
    lastFetchedAt: Date | null
    fetchStatus: $Enums.FetchStatus | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GitHubProfileCountAggregateOutputType = {
    id: number
    studentId: number
    username: number
    profileUrl: number
    totalRepos: number
    totalCommits: number
    totalStars: number
    totalForks: number
    languagesUsed: number
    frameworks: number
    repositories: number
    lastFetchedAt: number
    fetchStatus: number
    errorMessage: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GitHubProfileAvgAggregateInputType = {
    totalRepos?: true
    totalCommits?: true
    totalStars?: true
    totalForks?: true
  }

  export type GitHubProfileSumAggregateInputType = {
    totalRepos?: true
    totalCommits?: true
    totalStars?: true
    totalForks?: true
  }

  export type GitHubProfileMinAggregateInputType = {
    id?: true
    studentId?: true
    username?: true
    profileUrl?: true
    totalRepos?: true
    totalCommits?: true
    totalStars?: true
    totalForks?: true
    lastFetchedAt?: true
    fetchStatus?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GitHubProfileMaxAggregateInputType = {
    id?: true
    studentId?: true
    username?: true
    profileUrl?: true
    totalRepos?: true
    totalCommits?: true
    totalStars?: true
    totalForks?: true
    lastFetchedAt?: true
    fetchStatus?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GitHubProfileCountAggregateInputType = {
    id?: true
    studentId?: true
    username?: true
    profileUrl?: true
    totalRepos?: true
    totalCommits?: true
    totalStars?: true
    totalForks?: true
    languagesUsed?: true
    frameworks?: true
    repositories?: true
    lastFetchedAt?: true
    fetchStatus?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GitHubProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GitHubProfile to aggregate.
     */
    where?: GitHubProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitHubProfiles to fetch.
     */
    orderBy?: GitHubProfileOrderByWithRelationInput | GitHubProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GitHubProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitHubProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitHubProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GitHubProfiles
    **/
    _count?: true | GitHubProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GitHubProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GitHubProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GitHubProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GitHubProfileMaxAggregateInputType
  }

  export type GetGitHubProfileAggregateType<T extends GitHubProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateGitHubProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGitHubProfile[P]>
      : GetScalarType<T[P], AggregateGitHubProfile[P]>
  }




  export type GitHubProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GitHubProfileWhereInput
    orderBy?: GitHubProfileOrderByWithAggregationInput | GitHubProfileOrderByWithAggregationInput[]
    by: GitHubProfileScalarFieldEnum[] | GitHubProfileScalarFieldEnum
    having?: GitHubProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GitHubProfileCountAggregateInputType | true
    _avg?: GitHubProfileAvgAggregateInputType
    _sum?: GitHubProfileSumAggregateInputType
    _min?: GitHubProfileMinAggregateInputType
    _max?: GitHubProfileMaxAggregateInputType
  }

  export type GitHubProfileGroupByOutputType = {
    id: string
    studentId: string
    username: string
    profileUrl: string
    totalRepos: number
    totalCommits: number
    totalStars: number
    totalForks: number
    languagesUsed: JsonValue
    frameworks: JsonValue
    repositories: JsonValue
    lastFetchedAt: Date | null
    fetchStatus: $Enums.FetchStatus
    errorMessage: string | null
    createdAt: Date
    updatedAt: Date
    _count: GitHubProfileCountAggregateOutputType | null
    _avg: GitHubProfileAvgAggregateOutputType | null
    _sum: GitHubProfileSumAggregateOutputType | null
    _min: GitHubProfileMinAggregateOutputType | null
    _max: GitHubProfileMaxAggregateOutputType | null
  }

  type GetGitHubProfileGroupByPayload<T extends GitHubProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GitHubProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GitHubProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GitHubProfileGroupByOutputType[P]>
            : GetScalarType<T[P], GitHubProfileGroupByOutputType[P]>
        }
      >
    >


  export type GitHubProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    username?: boolean
    profileUrl?: boolean
    totalRepos?: boolean
    totalCommits?: boolean
    totalStars?: boolean
    totalForks?: boolean
    languagesUsed?: boolean
    frameworks?: boolean
    repositories?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gitHubProfile"]>

  export type GitHubProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    username?: boolean
    profileUrl?: boolean
    totalRepos?: boolean
    totalCommits?: boolean
    totalStars?: boolean
    totalForks?: boolean
    languagesUsed?: boolean
    frameworks?: boolean
    repositories?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gitHubProfile"]>

  export type GitHubProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    username?: boolean
    profileUrl?: boolean
    totalRepos?: boolean
    totalCommits?: boolean
    totalStars?: boolean
    totalForks?: boolean
    languagesUsed?: boolean
    frameworks?: boolean
    repositories?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gitHubProfile"]>

  export type GitHubProfileSelectScalar = {
    id?: boolean
    studentId?: boolean
    username?: boolean
    profileUrl?: boolean
    totalRepos?: boolean
    totalCommits?: boolean
    totalStars?: boolean
    totalForks?: boolean
    languagesUsed?: boolean
    frameworks?: boolean
    repositories?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GitHubProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "studentId" | "username" | "profileUrl" | "totalRepos" | "totalCommits" | "totalStars" | "totalForks" | "languagesUsed" | "frameworks" | "repositories" | "lastFetchedAt" | "fetchStatus" | "errorMessage" | "createdAt" | "updatedAt", ExtArgs["result"]["gitHubProfile"]>
  export type GitHubProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type GitHubProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type GitHubProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $GitHubProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GitHubProfile"
    objects: {
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      studentId: string
      username: string
      profileUrl: string
      totalRepos: number
      totalCommits: number
      totalStars: number
      totalForks: number
      languagesUsed: Prisma.JsonValue
      frameworks: Prisma.JsonValue
      repositories: Prisma.JsonValue
      lastFetchedAt: Date | null
      fetchStatus: $Enums.FetchStatus
      errorMessage: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gitHubProfile"]>
    composites: {}
  }

  type GitHubProfileGetPayload<S extends boolean | null | undefined | GitHubProfileDefaultArgs> = $Result.GetResult<Prisma.$GitHubProfilePayload, S>

  type GitHubProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GitHubProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GitHubProfileCountAggregateInputType | true
    }

  export interface GitHubProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GitHubProfile'], meta: { name: 'GitHubProfile' } }
    /**
     * Find zero or one GitHubProfile that matches the filter.
     * @param {GitHubProfileFindUniqueArgs} args - Arguments to find a GitHubProfile
     * @example
     * // Get one GitHubProfile
     * const gitHubProfile = await prisma.gitHubProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GitHubProfileFindUniqueArgs>(args: SelectSubset<T, GitHubProfileFindUniqueArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GitHubProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GitHubProfileFindUniqueOrThrowArgs} args - Arguments to find a GitHubProfile
     * @example
     * // Get one GitHubProfile
     * const gitHubProfile = await prisma.gitHubProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GitHubProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, GitHubProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GitHubProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitHubProfileFindFirstArgs} args - Arguments to find a GitHubProfile
     * @example
     * // Get one GitHubProfile
     * const gitHubProfile = await prisma.gitHubProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GitHubProfileFindFirstArgs>(args?: SelectSubset<T, GitHubProfileFindFirstArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GitHubProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitHubProfileFindFirstOrThrowArgs} args - Arguments to find a GitHubProfile
     * @example
     * // Get one GitHubProfile
     * const gitHubProfile = await prisma.gitHubProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GitHubProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, GitHubProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GitHubProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitHubProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GitHubProfiles
     * const gitHubProfiles = await prisma.gitHubProfile.findMany()
     * 
     * // Get first 10 GitHubProfiles
     * const gitHubProfiles = await prisma.gitHubProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gitHubProfileWithIdOnly = await prisma.gitHubProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GitHubProfileFindManyArgs>(args?: SelectSubset<T, GitHubProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GitHubProfile.
     * @param {GitHubProfileCreateArgs} args - Arguments to create a GitHubProfile.
     * @example
     * // Create one GitHubProfile
     * const GitHubProfile = await prisma.gitHubProfile.create({
     *   data: {
     *     // ... data to create a GitHubProfile
     *   }
     * })
     * 
     */
    create<T extends GitHubProfileCreateArgs>(args: SelectSubset<T, GitHubProfileCreateArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GitHubProfiles.
     * @param {GitHubProfileCreateManyArgs} args - Arguments to create many GitHubProfiles.
     * @example
     * // Create many GitHubProfiles
     * const gitHubProfile = await prisma.gitHubProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GitHubProfileCreateManyArgs>(args?: SelectSubset<T, GitHubProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GitHubProfiles and returns the data saved in the database.
     * @param {GitHubProfileCreateManyAndReturnArgs} args - Arguments to create many GitHubProfiles.
     * @example
     * // Create many GitHubProfiles
     * const gitHubProfile = await prisma.gitHubProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GitHubProfiles and only return the `id`
     * const gitHubProfileWithIdOnly = await prisma.gitHubProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GitHubProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, GitHubProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GitHubProfile.
     * @param {GitHubProfileDeleteArgs} args - Arguments to delete one GitHubProfile.
     * @example
     * // Delete one GitHubProfile
     * const GitHubProfile = await prisma.gitHubProfile.delete({
     *   where: {
     *     // ... filter to delete one GitHubProfile
     *   }
     * })
     * 
     */
    delete<T extends GitHubProfileDeleteArgs>(args: SelectSubset<T, GitHubProfileDeleteArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GitHubProfile.
     * @param {GitHubProfileUpdateArgs} args - Arguments to update one GitHubProfile.
     * @example
     * // Update one GitHubProfile
     * const gitHubProfile = await prisma.gitHubProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GitHubProfileUpdateArgs>(args: SelectSubset<T, GitHubProfileUpdateArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GitHubProfiles.
     * @param {GitHubProfileDeleteManyArgs} args - Arguments to filter GitHubProfiles to delete.
     * @example
     * // Delete a few GitHubProfiles
     * const { count } = await prisma.gitHubProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GitHubProfileDeleteManyArgs>(args?: SelectSubset<T, GitHubProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GitHubProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitHubProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GitHubProfiles
     * const gitHubProfile = await prisma.gitHubProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GitHubProfileUpdateManyArgs>(args: SelectSubset<T, GitHubProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GitHubProfiles and returns the data updated in the database.
     * @param {GitHubProfileUpdateManyAndReturnArgs} args - Arguments to update many GitHubProfiles.
     * @example
     * // Update many GitHubProfiles
     * const gitHubProfile = await prisma.gitHubProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GitHubProfiles and only return the `id`
     * const gitHubProfileWithIdOnly = await prisma.gitHubProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GitHubProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, GitHubProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GitHubProfile.
     * @param {GitHubProfileUpsertArgs} args - Arguments to update or create a GitHubProfile.
     * @example
     * // Update or create a GitHubProfile
     * const gitHubProfile = await prisma.gitHubProfile.upsert({
     *   create: {
     *     // ... data to create a GitHubProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GitHubProfile we want to update
     *   }
     * })
     */
    upsert<T extends GitHubProfileUpsertArgs>(args: SelectSubset<T, GitHubProfileUpsertArgs<ExtArgs>>): Prisma__GitHubProfileClient<$Result.GetResult<Prisma.$GitHubProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GitHubProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitHubProfileCountArgs} args - Arguments to filter GitHubProfiles to count.
     * @example
     * // Count the number of GitHubProfiles
     * const count = await prisma.gitHubProfile.count({
     *   where: {
     *     // ... the filter for the GitHubProfiles we want to count
     *   }
     * })
    **/
    count<T extends GitHubProfileCountArgs>(
      args?: Subset<T, GitHubProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GitHubProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GitHubProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitHubProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GitHubProfileAggregateArgs>(args: Subset<T, GitHubProfileAggregateArgs>): Prisma.PrismaPromise<GetGitHubProfileAggregateType<T>>

    /**
     * Group by GitHubProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GitHubProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GitHubProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GitHubProfileGroupByArgs['orderBy'] }
        : { orderBy?: GitHubProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GitHubProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGitHubProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GitHubProfile model
   */
  readonly fields: GitHubProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GitHubProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GitHubProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GitHubProfile model
   */
  interface GitHubProfileFieldRefs {
    readonly id: FieldRef<"GitHubProfile", 'String'>
    readonly studentId: FieldRef<"GitHubProfile", 'String'>
    readonly username: FieldRef<"GitHubProfile", 'String'>
    readonly profileUrl: FieldRef<"GitHubProfile", 'String'>
    readonly totalRepos: FieldRef<"GitHubProfile", 'Int'>
    readonly totalCommits: FieldRef<"GitHubProfile", 'Int'>
    readonly totalStars: FieldRef<"GitHubProfile", 'Int'>
    readonly totalForks: FieldRef<"GitHubProfile", 'Int'>
    readonly languagesUsed: FieldRef<"GitHubProfile", 'Json'>
    readonly frameworks: FieldRef<"GitHubProfile", 'Json'>
    readonly repositories: FieldRef<"GitHubProfile", 'Json'>
    readonly lastFetchedAt: FieldRef<"GitHubProfile", 'DateTime'>
    readonly fetchStatus: FieldRef<"GitHubProfile", 'FetchStatus'>
    readonly errorMessage: FieldRef<"GitHubProfile", 'String'>
    readonly createdAt: FieldRef<"GitHubProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"GitHubProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GitHubProfile findUnique
   */
  export type GitHubProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * Filter, which GitHubProfile to fetch.
     */
    where: GitHubProfileWhereUniqueInput
  }

  /**
   * GitHubProfile findUniqueOrThrow
   */
  export type GitHubProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * Filter, which GitHubProfile to fetch.
     */
    where: GitHubProfileWhereUniqueInput
  }

  /**
   * GitHubProfile findFirst
   */
  export type GitHubProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * Filter, which GitHubProfile to fetch.
     */
    where?: GitHubProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitHubProfiles to fetch.
     */
    orderBy?: GitHubProfileOrderByWithRelationInput | GitHubProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GitHubProfiles.
     */
    cursor?: GitHubProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitHubProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitHubProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GitHubProfiles.
     */
    distinct?: GitHubProfileScalarFieldEnum | GitHubProfileScalarFieldEnum[]
  }

  /**
   * GitHubProfile findFirstOrThrow
   */
  export type GitHubProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * Filter, which GitHubProfile to fetch.
     */
    where?: GitHubProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitHubProfiles to fetch.
     */
    orderBy?: GitHubProfileOrderByWithRelationInput | GitHubProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GitHubProfiles.
     */
    cursor?: GitHubProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitHubProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitHubProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GitHubProfiles.
     */
    distinct?: GitHubProfileScalarFieldEnum | GitHubProfileScalarFieldEnum[]
  }

  /**
   * GitHubProfile findMany
   */
  export type GitHubProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * Filter, which GitHubProfiles to fetch.
     */
    where?: GitHubProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GitHubProfiles to fetch.
     */
    orderBy?: GitHubProfileOrderByWithRelationInput | GitHubProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GitHubProfiles.
     */
    cursor?: GitHubProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GitHubProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GitHubProfiles.
     */
    skip?: number
    distinct?: GitHubProfileScalarFieldEnum | GitHubProfileScalarFieldEnum[]
  }

  /**
   * GitHubProfile create
   */
  export type GitHubProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a GitHubProfile.
     */
    data: XOR<GitHubProfileCreateInput, GitHubProfileUncheckedCreateInput>
  }

  /**
   * GitHubProfile createMany
   */
  export type GitHubProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GitHubProfiles.
     */
    data: GitHubProfileCreateManyInput | GitHubProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GitHubProfile createManyAndReturn
   */
  export type GitHubProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * The data used to create many GitHubProfiles.
     */
    data: GitHubProfileCreateManyInput | GitHubProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GitHubProfile update
   */
  export type GitHubProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a GitHubProfile.
     */
    data: XOR<GitHubProfileUpdateInput, GitHubProfileUncheckedUpdateInput>
    /**
     * Choose, which GitHubProfile to update.
     */
    where: GitHubProfileWhereUniqueInput
  }

  /**
   * GitHubProfile updateMany
   */
  export type GitHubProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GitHubProfiles.
     */
    data: XOR<GitHubProfileUpdateManyMutationInput, GitHubProfileUncheckedUpdateManyInput>
    /**
     * Filter which GitHubProfiles to update
     */
    where?: GitHubProfileWhereInput
    /**
     * Limit how many GitHubProfiles to update.
     */
    limit?: number
  }

  /**
   * GitHubProfile updateManyAndReturn
   */
  export type GitHubProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * The data used to update GitHubProfiles.
     */
    data: XOR<GitHubProfileUpdateManyMutationInput, GitHubProfileUncheckedUpdateManyInput>
    /**
     * Filter which GitHubProfiles to update
     */
    where?: GitHubProfileWhereInput
    /**
     * Limit how many GitHubProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * GitHubProfile upsert
   */
  export type GitHubProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the GitHubProfile to update in case it exists.
     */
    where: GitHubProfileWhereUniqueInput
    /**
     * In case the GitHubProfile found by the `where` argument doesn't exist, create a new GitHubProfile with this data.
     */
    create: XOR<GitHubProfileCreateInput, GitHubProfileUncheckedCreateInput>
    /**
     * In case the GitHubProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GitHubProfileUpdateInput, GitHubProfileUncheckedUpdateInput>
  }

  /**
   * GitHubProfile delete
   */
  export type GitHubProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
    /**
     * Filter which GitHubProfile to delete.
     */
    where: GitHubProfileWhereUniqueInput
  }

  /**
   * GitHubProfile deleteMany
   */
  export type GitHubProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GitHubProfiles to delete
     */
    where?: GitHubProfileWhereInput
    /**
     * Limit how many GitHubProfiles to delete.
     */
    limit?: number
  }

  /**
   * GitHubProfile without action
   */
  export type GitHubProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GitHubProfile
     */
    select?: GitHubProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GitHubProfile
     */
    omit?: GitHubProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GitHubProfileInclude<ExtArgs> | null
  }


  /**
   * Model DSAProfile
   */

  export type AggregateDSAProfile = {
    _count: DSAProfileCountAggregateOutputType | null
    _avg: DSAProfileAvgAggregateOutputType | null
    _sum: DSAProfileSumAggregateOutputType | null
    _min: DSAProfileMinAggregateOutputType | null
    _max: DSAProfileMaxAggregateOutputType | null
  }

  export type DSAProfileAvgAggregateOutputType = {
    totalSolved: number | null
    easySolved: number | null
    mediumSolved: number | null
    hardSolved: number | null
    rating: number | null
  }

  export type DSAProfileSumAggregateOutputType = {
    totalSolved: number | null
    easySolved: number | null
    mediumSolved: number | null
    hardSolved: number | null
    rating: number | null
  }

  export type DSAProfileMinAggregateOutputType = {
    id: string | null
    studentId: string | null
    platform: $Enums.Platform | null
    username: string | null
    profileUrl: string | null
    totalSolved: number | null
    easySolved: number | null
    mediumSolved: number | null
    hardSolved: number | null
    rating: number | null
    lastFetchedAt: Date | null
    fetchStatus: $Enums.FetchStatus | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DSAProfileMaxAggregateOutputType = {
    id: string | null
    studentId: string | null
    platform: $Enums.Platform | null
    username: string | null
    profileUrl: string | null
    totalSolved: number | null
    easySolved: number | null
    mediumSolved: number | null
    hardSolved: number | null
    rating: number | null
    lastFetchedAt: Date | null
    fetchStatus: $Enums.FetchStatus | null
    errorMessage: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DSAProfileCountAggregateOutputType = {
    id: number
    studentId: number
    platform: number
    username: number
    profileUrl: number
    totalSolved: number
    easySolved: number
    mediumSolved: number
    hardSolved: number
    rating: number
    lastFetchedAt: number
    fetchStatus: number
    errorMessage: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DSAProfileAvgAggregateInputType = {
    totalSolved?: true
    easySolved?: true
    mediumSolved?: true
    hardSolved?: true
    rating?: true
  }

  export type DSAProfileSumAggregateInputType = {
    totalSolved?: true
    easySolved?: true
    mediumSolved?: true
    hardSolved?: true
    rating?: true
  }

  export type DSAProfileMinAggregateInputType = {
    id?: true
    studentId?: true
    platform?: true
    username?: true
    profileUrl?: true
    totalSolved?: true
    easySolved?: true
    mediumSolved?: true
    hardSolved?: true
    rating?: true
    lastFetchedAt?: true
    fetchStatus?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DSAProfileMaxAggregateInputType = {
    id?: true
    studentId?: true
    platform?: true
    username?: true
    profileUrl?: true
    totalSolved?: true
    easySolved?: true
    mediumSolved?: true
    hardSolved?: true
    rating?: true
    lastFetchedAt?: true
    fetchStatus?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DSAProfileCountAggregateInputType = {
    id?: true
    studentId?: true
    platform?: true
    username?: true
    profileUrl?: true
    totalSolved?: true
    easySolved?: true
    mediumSolved?: true
    hardSolved?: true
    rating?: true
    lastFetchedAt?: true
    fetchStatus?: true
    errorMessage?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DSAProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DSAProfile to aggregate.
     */
    where?: DSAProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DSAProfiles to fetch.
     */
    orderBy?: DSAProfileOrderByWithRelationInput | DSAProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DSAProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DSAProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DSAProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DSAProfiles
    **/
    _count?: true | DSAProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DSAProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DSAProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DSAProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DSAProfileMaxAggregateInputType
  }

  export type GetDSAProfileAggregateType<T extends DSAProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateDSAProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDSAProfile[P]>
      : GetScalarType<T[P], AggregateDSAProfile[P]>
  }




  export type DSAProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DSAProfileWhereInput
    orderBy?: DSAProfileOrderByWithAggregationInput | DSAProfileOrderByWithAggregationInput[]
    by: DSAProfileScalarFieldEnum[] | DSAProfileScalarFieldEnum
    having?: DSAProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DSAProfileCountAggregateInputType | true
    _avg?: DSAProfileAvgAggregateInputType
    _sum?: DSAProfileSumAggregateInputType
    _min?: DSAProfileMinAggregateInputType
    _max?: DSAProfileMaxAggregateInputType
  }

  export type DSAProfileGroupByOutputType = {
    id: string
    studentId: string
    platform: $Enums.Platform
    username: string
    profileUrl: string
    totalSolved: number
    easySolved: number
    mediumSolved: number
    hardSolved: number
    rating: number | null
    lastFetchedAt: Date | null
    fetchStatus: $Enums.FetchStatus
    errorMessage: string | null
    createdAt: Date
    updatedAt: Date
    _count: DSAProfileCountAggregateOutputType | null
    _avg: DSAProfileAvgAggregateOutputType | null
    _sum: DSAProfileSumAggregateOutputType | null
    _min: DSAProfileMinAggregateOutputType | null
    _max: DSAProfileMaxAggregateOutputType | null
  }

  type GetDSAProfileGroupByPayload<T extends DSAProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DSAProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DSAProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DSAProfileGroupByOutputType[P]>
            : GetScalarType<T[P], DSAProfileGroupByOutputType[P]>
        }
      >
    >


  export type DSAProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    platform?: boolean
    username?: boolean
    profileUrl?: boolean
    totalSolved?: boolean
    easySolved?: boolean
    mediumSolved?: boolean
    hardSolved?: boolean
    rating?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dSAProfile"]>

  export type DSAProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    platform?: boolean
    username?: boolean
    profileUrl?: boolean
    totalSolved?: boolean
    easySolved?: boolean
    mediumSolved?: boolean
    hardSolved?: boolean
    rating?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dSAProfile"]>

  export type DSAProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    platform?: boolean
    username?: boolean
    profileUrl?: boolean
    totalSolved?: boolean
    easySolved?: boolean
    mediumSolved?: boolean
    hardSolved?: boolean
    rating?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dSAProfile"]>

  export type DSAProfileSelectScalar = {
    id?: boolean
    studentId?: boolean
    platform?: boolean
    username?: boolean
    profileUrl?: boolean
    totalSolved?: boolean
    easySolved?: boolean
    mediumSolved?: boolean
    hardSolved?: boolean
    rating?: boolean
    lastFetchedAt?: boolean
    fetchStatus?: boolean
    errorMessage?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DSAProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "studentId" | "platform" | "username" | "profileUrl" | "totalSolved" | "easySolved" | "mediumSolved" | "hardSolved" | "rating" | "lastFetchedAt" | "fetchStatus" | "errorMessage" | "createdAt" | "updatedAt", ExtArgs["result"]["dSAProfile"]>
  export type DSAProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type DSAProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type DSAProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $DSAProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DSAProfile"
    objects: {
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      studentId: string
      platform: $Enums.Platform
      username: string
      profileUrl: string
      totalSolved: number
      easySolved: number
      mediumSolved: number
      hardSolved: number
      rating: number | null
      lastFetchedAt: Date | null
      fetchStatus: $Enums.FetchStatus
      errorMessage: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dSAProfile"]>
    composites: {}
  }

  type DSAProfileGetPayload<S extends boolean | null | undefined | DSAProfileDefaultArgs> = $Result.GetResult<Prisma.$DSAProfilePayload, S>

  type DSAProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DSAProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DSAProfileCountAggregateInputType | true
    }

  export interface DSAProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DSAProfile'], meta: { name: 'DSAProfile' } }
    /**
     * Find zero or one DSAProfile that matches the filter.
     * @param {DSAProfileFindUniqueArgs} args - Arguments to find a DSAProfile
     * @example
     * // Get one DSAProfile
     * const dSAProfile = await prisma.dSAProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DSAProfileFindUniqueArgs>(args: SelectSubset<T, DSAProfileFindUniqueArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DSAProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DSAProfileFindUniqueOrThrowArgs} args - Arguments to find a DSAProfile
     * @example
     * // Get one DSAProfile
     * const dSAProfile = await prisma.dSAProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DSAProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, DSAProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DSAProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DSAProfileFindFirstArgs} args - Arguments to find a DSAProfile
     * @example
     * // Get one DSAProfile
     * const dSAProfile = await prisma.dSAProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DSAProfileFindFirstArgs>(args?: SelectSubset<T, DSAProfileFindFirstArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DSAProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DSAProfileFindFirstOrThrowArgs} args - Arguments to find a DSAProfile
     * @example
     * // Get one DSAProfile
     * const dSAProfile = await prisma.dSAProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DSAProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, DSAProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DSAProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DSAProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DSAProfiles
     * const dSAProfiles = await prisma.dSAProfile.findMany()
     * 
     * // Get first 10 DSAProfiles
     * const dSAProfiles = await prisma.dSAProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dSAProfileWithIdOnly = await prisma.dSAProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DSAProfileFindManyArgs>(args?: SelectSubset<T, DSAProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DSAProfile.
     * @param {DSAProfileCreateArgs} args - Arguments to create a DSAProfile.
     * @example
     * // Create one DSAProfile
     * const DSAProfile = await prisma.dSAProfile.create({
     *   data: {
     *     // ... data to create a DSAProfile
     *   }
     * })
     * 
     */
    create<T extends DSAProfileCreateArgs>(args: SelectSubset<T, DSAProfileCreateArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DSAProfiles.
     * @param {DSAProfileCreateManyArgs} args - Arguments to create many DSAProfiles.
     * @example
     * // Create many DSAProfiles
     * const dSAProfile = await prisma.dSAProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DSAProfileCreateManyArgs>(args?: SelectSubset<T, DSAProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DSAProfiles and returns the data saved in the database.
     * @param {DSAProfileCreateManyAndReturnArgs} args - Arguments to create many DSAProfiles.
     * @example
     * // Create many DSAProfiles
     * const dSAProfile = await prisma.dSAProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DSAProfiles and only return the `id`
     * const dSAProfileWithIdOnly = await prisma.dSAProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DSAProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, DSAProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DSAProfile.
     * @param {DSAProfileDeleteArgs} args - Arguments to delete one DSAProfile.
     * @example
     * // Delete one DSAProfile
     * const DSAProfile = await prisma.dSAProfile.delete({
     *   where: {
     *     // ... filter to delete one DSAProfile
     *   }
     * })
     * 
     */
    delete<T extends DSAProfileDeleteArgs>(args: SelectSubset<T, DSAProfileDeleteArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DSAProfile.
     * @param {DSAProfileUpdateArgs} args - Arguments to update one DSAProfile.
     * @example
     * // Update one DSAProfile
     * const dSAProfile = await prisma.dSAProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DSAProfileUpdateArgs>(args: SelectSubset<T, DSAProfileUpdateArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DSAProfiles.
     * @param {DSAProfileDeleteManyArgs} args - Arguments to filter DSAProfiles to delete.
     * @example
     * // Delete a few DSAProfiles
     * const { count } = await prisma.dSAProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DSAProfileDeleteManyArgs>(args?: SelectSubset<T, DSAProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DSAProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DSAProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DSAProfiles
     * const dSAProfile = await prisma.dSAProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DSAProfileUpdateManyArgs>(args: SelectSubset<T, DSAProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DSAProfiles and returns the data updated in the database.
     * @param {DSAProfileUpdateManyAndReturnArgs} args - Arguments to update many DSAProfiles.
     * @example
     * // Update many DSAProfiles
     * const dSAProfile = await prisma.dSAProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DSAProfiles and only return the `id`
     * const dSAProfileWithIdOnly = await prisma.dSAProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DSAProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, DSAProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DSAProfile.
     * @param {DSAProfileUpsertArgs} args - Arguments to update or create a DSAProfile.
     * @example
     * // Update or create a DSAProfile
     * const dSAProfile = await prisma.dSAProfile.upsert({
     *   create: {
     *     // ... data to create a DSAProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DSAProfile we want to update
     *   }
     * })
     */
    upsert<T extends DSAProfileUpsertArgs>(args: SelectSubset<T, DSAProfileUpsertArgs<ExtArgs>>): Prisma__DSAProfileClient<$Result.GetResult<Prisma.$DSAProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DSAProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DSAProfileCountArgs} args - Arguments to filter DSAProfiles to count.
     * @example
     * // Count the number of DSAProfiles
     * const count = await prisma.dSAProfile.count({
     *   where: {
     *     // ... the filter for the DSAProfiles we want to count
     *   }
     * })
    **/
    count<T extends DSAProfileCountArgs>(
      args?: Subset<T, DSAProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DSAProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DSAProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DSAProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DSAProfileAggregateArgs>(args: Subset<T, DSAProfileAggregateArgs>): Prisma.PrismaPromise<GetDSAProfileAggregateType<T>>

    /**
     * Group by DSAProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DSAProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DSAProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DSAProfileGroupByArgs['orderBy'] }
        : { orderBy?: DSAProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DSAProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDSAProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DSAProfile model
   */
  readonly fields: DSAProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DSAProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DSAProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DSAProfile model
   */
  interface DSAProfileFieldRefs {
    readonly id: FieldRef<"DSAProfile", 'String'>
    readonly studentId: FieldRef<"DSAProfile", 'String'>
    readonly platform: FieldRef<"DSAProfile", 'Platform'>
    readonly username: FieldRef<"DSAProfile", 'String'>
    readonly profileUrl: FieldRef<"DSAProfile", 'String'>
    readonly totalSolved: FieldRef<"DSAProfile", 'Int'>
    readonly easySolved: FieldRef<"DSAProfile", 'Int'>
    readonly mediumSolved: FieldRef<"DSAProfile", 'Int'>
    readonly hardSolved: FieldRef<"DSAProfile", 'Int'>
    readonly rating: FieldRef<"DSAProfile", 'Float'>
    readonly lastFetchedAt: FieldRef<"DSAProfile", 'DateTime'>
    readonly fetchStatus: FieldRef<"DSAProfile", 'FetchStatus'>
    readonly errorMessage: FieldRef<"DSAProfile", 'String'>
    readonly createdAt: FieldRef<"DSAProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"DSAProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DSAProfile findUnique
   */
  export type DSAProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * Filter, which DSAProfile to fetch.
     */
    where: DSAProfileWhereUniqueInput
  }

  /**
   * DSAProfile findUniqueOrThrow
   */
  export type DSAProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * Filter, which DSAProfile to fetch.
     */
    where: DSAProfileWhereUniqueInput
  }

  /**
   * DSAProfile findFirst
   */
  export type DSAProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * Filter, which DSAProfile to fetch.
     */
    where?: DSAProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DSAProfiles to fetch.
     */
    orderBy?: DSAProfileOrderByWithRelationInput | DSAProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DSAProfiles.
     */
    cursor?: DSAProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DSAProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DSAProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DSAProfiles.
     */
    distinct?: DSAProfileScalarFieldEnum | DSAProfileScalarFieldEnum[]
  }

  /**
   * DSAProfile findFirstOrThrow
   */
  export type DSAProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * Filter, which DSAProfile to fetch.
     */
    where?: DSAProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DSAProfiles to fetch.
     */
    orderBy?: DSAProfileOrderByWithRelationInput | DSAProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DSAProfiles.
     */
    cursor?: DSAProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DSAProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DSAProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DSAProfiles.
     */
    distinct?: DSAProfileScalarFieldEnum | DSAProfileScalarFieldEnum[]
  }

  /**
   * DSAProfile findMany
   */
  export type DSAProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * Filter, which DSAProfiles to fetch.
     */
    where?: DSAProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DSAProfiles to fetch.
     */
    orderBy?: DSAProfileOrderByWithRelationInput | DSAProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DSAProfiles.
     */
    cursor?: DSAProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DSAProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DSAProfiles.
     */
    skip?: number
    distinct?: DSAProfileScalarFieldEnum | DSAProfileScalarFieldEnum[]
  }

  /**
   * DSAProfile create
   */
  export type DSAProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a DSAProfile.
     */
    data: XOR<DSAProfileCreateInput, DSAProfileUncheckedCreateInput>
  }

  /**
   * DSAProfile createMany
   */
  export type DSAProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DSAProfiles.
     */
    data: DSAProfileCreateManyInput | DSAProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DSAProfile createManyAndReturn
   */
  export type DSAProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * The data used to create many DSAProfiles.
     */
    data: DSAProfileCreateManyInput | DSAProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DSAProfile update
   */
  export type DSAProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a DSAProfile.
     */
    data: XOR<DSAProfileUpdateInput, DSAProfileUncheckedUpdateInput>
    /**
     * Choose, which DSAProfile to update.
     */
    where: DSAProfileWhereUniqueInput
  }

  /**
   * DSAProfile updateMany
   */
  export type DSAProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DSAProfiles.
     */
    data: XOR<DSAProfileUpdateManyMutationInput, DSAProfileUncheckedUpdateManyInput>
    /**
     * Filter which DSAProfiles to update
     */
    where?: DSAProfileWhereInput
    /**
     * Limit how many DSAProfiles to update.
     */
    limit?: number
  }

  /**
   * DSAProfile updateManyAndReturn
   */
  export type DSAProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * The data used to update DSAProfiles.
     */
    data: XOR<DSAProfileUpdateManyMutationInput, DSAProfileUncheckedUpdateManyInput>
    /**
     * Filter which DSAProfiles to update
     */
    where?: DSAProfileWhereInput
    /**
     * Limit how many DSAProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DSAProfile upsert
   */
  export type DSAProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the DSAProfile to update in case it exists.
     */
    where: DSAProfileWhereUniqueInput
    /**
     * In case the DSAProfile found by the `where` argument doesn't exist, create a new DSAProfile with this data.
     */
    create: XOR<DSAProfileCreateInput, DSAProfileUncheckedCreateInput>
    /**
     * In case the DSAProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DSAProfileUpdateInput, DSAProfileUncheckedUpdateInput>
  }

  /**
   * DSAProfile delete
   */
  export type DSAProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
    /**
     * Filter which DSAProfile to delete.
     */
    where: DSAProfileWhereUniqueInput
  }

  /**
   * DSAProfile deleteMany
   */
  export type DSAProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DSAProfiles to delete
     */
    where?: DSAProfileWhereInput
    /**
     * Limit how many DSAProfiles to delete.
     */
    limit?: number
  }

  /**
   * DSAProfile without action
   */
  export type DSAProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DSAProfile
     */
    select?: DSAProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DSAProfile
     */
    omit?: DSAProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DSAProfileInclude<ExtArgs> | null
  }


  /**
   * Model JRICalculation
   */

  export type AggregateJRICalculation = {
    _count: JRICalculationCountAggregateOutputType | null
    _avg: JRICalculationAvgAggregateOutputType | null
    _sum: JRICalculationSumAggregateOutputType | null
    _min: JRICalculationMinAggregateOutputType | null
    _max: JRICalculationMaxAggregateOutputType | null
  }

  export type JRICalculationAvgAggregateOutputType = {
    jriScore: number | null
    githubScore: number | null
    dsaScore: number | null
    academicScore: number | null
    hackathonScore: number | null
  }

  export type JRICalculationSumAggregateOutputType = {
    jriScore: number | null
    githubScore: number | null
    dsaScore: number | null
    academicScore: number | null
    hackathonScore: number | null
  }

  export type JRICalculationMinAggregateOutputType = {
    id: string | null
    studentId: string | null
    jriScore: number | null
    githubScore: number | null
    dsaScore: number | null
    academicScore: number | null
    hackathonScore: number | null
    algorithmVersion: string | null
    createdAt: Date | null
  }

  export type JRICalculationMaxAggregateOutputType = {
    id: string | null
    studentId: string | null
    jriScore: number | null
    githubScore: number | null
    dsaScore: number | null
    academicScore: number | null
    hackathonScore: number | null
    algorithmVersion: string | null
    createdAt: Date | null
  }

  export type JRICalculationCountAggregateOutputType = {
    id: number
    studentId: number
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: number
    rawScores: number
    algorithmVersion: number
    createdAt: number
    _all: number
  }


  export type JRICalculationAvgAggregateInputType = {
    jriScore?: true
    githubScore?: true
    dsaScore?: true
    academicScore?: true
    hackathonScore?: true
  }

  export type JRICalculationSumAggregateInputType = {
    jriScore?: true
    githubScore?: true
    dsaScore?: true
    academicScore?: true
    hackathonScore?: true
  }

  export type JRICalculationMinAggregateInputType = {
    id?: true
    studentId?: true
    jriScore?: true
    githubScore?: true
    dsaScore?: true
    academicScore?: true
    hackathonScore?: true
    algorithmVersion?: true
    createdAt?: true
  }

  export type JRICalculationMaxAggregateInputType = {
    id?: true
    studentId?: true
    jriScore?: true
    githubScore?: true
    dsaScore?: true
    academicScore?: true
    hackathonScore?: true
    algorithmVersion?: true
    createdAt?: true
  }

  export type JRICalculationCountAggregateInputType = {
    id?: true
    studentId?: true
    jriScore?: true
    githubScore?: true
    dsaScore?: true
    academicScore?: true
    hackathonScore?: true
    weights?: true
    rawScores?: true
    algorithmVersion?: true
    createdAt?: true
    _all?: true
  }

  export type JRICalculationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JRICalculation to aggregate.
     */
    where?: JRICalculationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JRICalculations to fetch.
     */
    orderBy?: JRICalculationOrderByWithRelationInput | JRICalculationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JRICalculationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JRICalculations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JRICalculations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JRICalculations
    **/
    _count?: true | JRICalculationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: JRICalculationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: JRICalculationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JRICalculationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JRICalculationMaxAggregateInputType
  }

  export type GetJRICalculationAggregateType<T extends JRICalculationAggregateArgs> = {
        [P in keyof T & keyof AggregateJRICalculation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJRICalculation[P]>
      : GetScalarType<T[P], AggregateJRICalculation[P]>
  }




  export type JRICalculationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JRICalculationWhereInput
    orderBy?: JRICalculationOrderByWithAggregationInput | JRICalculationOrderByWithAggregationInput[]
    by: JRICalculationScalarFieldEnum[] | JRICalculationScalarFieldEnum
    having?: JRICalculationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JRICalculationCountAggregateInputType | true
    _avg?: JRICalculationAvgAggregateInputType
    _sum?: JRICalculationSumAggregateInputType
    _min?: JRICalculationMinAggregateInputType
    _max?: JRICalculationMaxAggregateInputType
  }

  export type JRICalculationGroupByOutputType = {
    id: string
    studentId: string
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: JsonValue
    rawScores: JsonValue
    algorithmVersion: string
    createdAt: Date
    _count: JRICalculationCountAggregateOutputType | null
    _avg: JRICalculationAvgAggregateOutputType | null
    _sum: JRICalculationSumAggregateOutputType | null
    _min: JRICalculationMinAggregateOutputType | null
    _max: JRICalculationMaxAggregateOutputType | null
  }

  type GetJRICalculationGroupByPayload<T extends JRICalculationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JRICalculationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JRICalculationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JRICalculationGroupByOutputType[P]>
            : GetScalarType<T[P], JRICalculationGroupByOutputType[P]>
        }
      >
    >


  export type JRICalculationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    jriScore?: boolean
    githubScore?: boolean
    dsaScore?: boolean
    academicScore?: boolean
    hackathonScore?: boolean
    weights?: boolean
    rawScores?: boolean
    algorithmVersion?: boolean
    createdAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jRICalculation"]>

  export type JRICalculationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    jriScore?: boolean
    githubScore?: boolean
    dsaScore?: boolean
    academicScore?: boolean
    hackathonScore?: boolean
    weights?: boolean
    rawScores?: boolean
    algorithmVersion?: boolean
    createdAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jRICalculation"]>

  export type JRICalculationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    jriScore?: boolean
    githubScore?: boolean
    dsaScore?: boolean
    academicScore?: boolean
    hackathonScore?: boolean
    weights?: boolean
    rawScores?: boolean
    algorithmVersion?: boolean
    createdAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["jRICalculation"]>

  export type JRICalculationSelectScalar = {
    id?: boolean
    studentId?: boolean
    jriScore?: boolean
    githubScore?: boolean
    dsaScore?: boolean
    academicScore?: boolean
    hackathonScore?: boolean
    weights?: boolean
    rawScores?: boolean
    algorithmVersion?: boolean
    createdAt?: boolean
  }

  export type JRICalculationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "studentId" | "jriScore" | "githubScore" | "dsaScore" | "academicScore" | "hackathonScore" | "weights" | "rawScores" | "algorithmVersion" | "createdAt", ExtArgs["result"]["jRICalculation"]>
  export type JRICalculationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type JRICalculationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type JRICalculationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $JRICalculationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JRICalculation"
    objects: {
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      studentId: string
      jriScore: number
      githubScore: number
      dsaScore: number
      academicScore: number
      hackathonScore: number
      weights: Prisma.JsonValue
      rawScores: Prisma.JsonValue
      algorithmVersion: string
      createdAt: Date
    }, ExtArgs["result"]["jRICalculation"]>
    composites: {}
  }

  type JRICalculationGetPayload<S extends boolean | null | undefined | JRICalculationDefaultArgs> = $Result.GetResult<Prisma.$JRICalculationPayload, S>

  type JRICalculationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<JRICalculationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JRICalculationCountAggregateInputType | true
    }

  export interface JRICalculationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JRICalculation'], meta: { name: 'JRICalculation' } }
    /**
     * Find zero or one JRICalculation that matches the filter.
     * @param {JRICalculationFindUniqueArgs} args - Arguments to find a JRICalculation
     * @example
     * // Get one JRICalculation
     * const jRICalculation = await prisma.jRICalculation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JRICalculationFindUniqueArgs>(args: SelectSubset<T, JRICalculationFindUniqueArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one JRICalculation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {JRICalculationFindUniqueOrThrowArgs} args - Arguments to find a JRICalculation
     * @example
     * // Get one JRICalculation
     * const jRICalculation = await prisma.jRICalculation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JRICalculationFindUniqueOrThrowArgs>(args: SelectSubset<T, JRICalculationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JRICalculation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JRICalculationFindFirstArgs} args - Arguments to find a JRICalculation
     * @example
     * // Get one JRICalculation
     * const jRICalculation = await prisma.jRICalculation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JRICalculationFindFirstArgs>(args?: SelectSubset<T, JRICalculationFindFirstArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JRICalculation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JRICalculationFindFirstOrThrowArgs} args - Arguments to find a JRICalculation
     * @example
     * // Get one JRICalculation
     * const jRICalculation = await prisma.jRICalculation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JRICalculationFindFirstOrThrowArgs>(args?: SelectSubset<T, JRICalculationFindFirstOrThrowArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more JRICalculations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JRICalculationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JRICalculations
     * const jRICalculations = await prisma.jRICalculation.findMany()
     * 
     * // Get first 10 JRICalculations
     * const jRICalculations = await prisma.jRICalculation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jRICalculationWithIdOnly = await prisma.jRICalculation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JRICalculationFindManyArgs>(args?: SelectSubset<T, JRICalculationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a JRICalculation.
     * @param {JRICalculationCreateArgs} args - Arguments to create a JRICalculation.
     * @example
     * // Create one JRICalculation
     * const JRICalculation = await prisma.jRICalculation.create({
     *   data: {
     *     // ... data to create a JRICalculation
     *   }
     * })
     * 
     */
    create<T extends JRICalculationCreateArgs>(args: SelectSubset<T, JRICalculationCreateArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many JRICalculations.
     * @param {JRICalculationCreateManyArgs} args - Arguments to create many JRICalculations.
     * @example
     * // Create many JRICalculations
     * const jRICalculation = await prisma.jRICalculation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JRICalculationCreateManyArgs>(args?: SelectSubset<T, JRICalculationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JRICalculations and returns the data saved in the database.
     * @param {JRICalculationCreateManyAndReturnArgs} args - Arguments to create many JRICalculations.
     * @example
     * // Create many JRICalculations
     * const jRICalculation = await prisma.jRICalculation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JRICalculations and only return the `id`
     * const jRICalculationWithIdOnly = await prisma.jRICalculation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JRICalculationCreateManyAndReturnArgs>(args?: SelectSubset<T, JRICalculationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a JRICalculation.
     * @param {JRICalculationDeleteArgs} args - Arguments to delete one JRICalculation.
     * @example
     * // Delete one JRICalculation
     * const JRICalculation = await prisma.jRICalculation.delete({
     *   where: {
     *     // ... filter to delete one JRICalculation
     *   }
     * })
     * 
     */
    delete<T extends JRICalculationDeleteArgs>(args: SelectSubset<T, JRICalculationDeleteArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one JRICalculation.
     * @param {JRICalculationUpdateArgs} args - Arguments to update one JRICalculation.
     * @example
     * // Update one JRICalculation
     * const jRICalculation = await prisma.jRICalculation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JRICalculationUpdateArgs>(args: SelectSubset<T, JRICalculationUpdateArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more JRICalculations.
     * @param {JRICalculationDeleteManyArgs} args - Arguments to filter JRICalculations to delete.
     * @example
     * // Delete a few JRICalculations
     * const { count } = await prisma.jRICalculation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JRICalculationDeleteManyArgs>(args?: SelectSubset<T, JRICalculationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JRICalculations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JRICalculationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JRICalculations
     * const jRICalculation = await prisma.jRICalculation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JRICalculationUpdateManyArgs>(args: SelectSubset<T, JRICalculationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JRICalculations and returns the data updated in the database.
     * @param {JRICalculationUpdateManyAndReturnArgs} args - Arguments to update many JRICalculations.
     * @example
     * // Update many JRICalculations
     * const jRICalculation = await prisma.jRICalculation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more JRICalculations and only return the `id`
     * const jRICalculationWithIdOnly = await prisma.jRICalculation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends JRICalculationUpdateManyAndReturnArgs>(args: SelectSubset<T, JRICalculationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one JRICalculation.
     * @param {JRICalculationUpsertArgs} args - Arguments to update or create a JRICalculation.
     * @example
     * // Update or create a JRICalculation
     * const jRICalculation = await prisma.jRICalculation.upsert({
     *   create: {
     *     // ... data to create a JRICalculation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JRICalculation we want to update
     *   }
     * })
     */
    upsert<T extends JRICalculationUpsertArgs>(args: SelectSubset<T, JRICalculationUpsertArgs<ExtArgs>>): Prisma__JRICalculationClient<$Result.GetResult<Prisma.$JRICalculationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of JRICalculations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JRICalculationCountArgs} args - Arguments to filter JRICalculations to count.
     * @example
     * // Count the number of JRICalculations
     * const count = await prisma.jRICalculation.count({
     *   where: {
     *     // ... the filter for the JRICalculations we want to count
     *   }
     * })
    **/
    count<T extends JRICalculationCountArgs>(
      args?: Subset<T, JRICalculationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JRICalculationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JRICalculation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JRICalculationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JRICalculationAggregateArgs>(args: Subset<T, JRICalculationAggregateArgs>): Prisma.PrismaPromise<GetJRICalculationAggregateType<T>>

    /**
     * Group by JRICalculation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JRICalculationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JRICalculationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JRICalculationGroupByArgs['orderBy'] }
        : { orderBy?: JRICalculationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JRICalculationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJRICalculationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JRICalculation model
   */
  readonly fields: JRICalculationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JRICalculation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JRICalculationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the JRICalculation model
   */
  interface JRICalculationFieldRefs {
    readonly id: FieldRef<"JRICalculation", 'String'>
    readonly studentId: FieldRef<"JRICalculation", 'String'>
    readonly jriScore: FieldRef<"JRICalculation", 'Float'>
    readonly githubScore: FieldRef<"JRICalculation", 'Float'>
    readonly dsaScore: FieldRef<"JRICalculation", 'Float'>
    readonly academicScore: FieldRef<"JRICalculation", 'Float'>
    readonly hackathonScore: FieldRef<"JRICalculation", 'Float'>
    readonly weights: FieldRef<"JRICalculation", 'Json'>
    readonly rawScores: FieldRef<"JRICalculation", 'Json'>
    readonly algorithmVersion: FieldRef<"JRICalculation", 'String'>
    readonly createdAt: FieldRef<"JRICalculation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * JRICalculation findUnique
   */
  export type JRICalculationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * Filter, which JRICalculation to fetch.
     */
    where: JRICalculationWhereUniqueInput
  }

  /**
   * JRICalculation findUniqueOrThrow
   */
  export type JRICalculationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * Filter, which JRICalculation to fetch.
     */
    where: JRICalculationWhereUniqueInput
  }

  /**
   * JRICalculation findFirst
   */
  export type JRICalculationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * Filter, which JRICalculation to fetch.
     */
    where?: JRICalculationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JRICalculations to fetch.
     */
    orderBy?: JRICalculationOrderByWithRelationInput | JRICalculationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JRICalculations.
     */
    cursor?: JRICalculationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JRICalculations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JRICalculations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JRICalculations.
     */
    distinct?: JRICalculationScalarFieldEnum | JRICalculationScalarFieldEnum[]
  }

  /**
   * JRICalculation findFirstOrThrow
   */
  export type JRICalculationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * Filter, which JRICalculation to fetch.
     */
    where?: JRICalculationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JRICalculations to fetch.
     */
    orderBy?: JRICalculationOrderByWithRelationInput | JRICalculationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JRICalculations.
     */
    cursor?: JRICalculationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JRICalculations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JRICalculations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JRICalculations.
     */
    distinct?: JRICalculationScalarFieldEnum | JRICalculationScalarFieldEnum[]
  }

  /**
   * JRICalculation findMany
   */
  export type JRICalculationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * Filter, which JRICalculations to fetch.
     */
    where?: JRICalculationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JRICalculations to fetch.
     */
    orderBy?: JRICalculationOrderByWithRelationInput | JRICalculationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JRICalculations.
     */
    cursor?: JRICalculationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JRICalculations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JRICalculations.
     */
    skip?: number
    distinct?: JRICalculationScalarFieldEnum | JRICalculationScalarFieldEnum[]
  }

  /**
   * JRICalculation create
   */
  export type JRICalculationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * The data needed to create a JRICalculation.
     */
    data: XOR<JRICalculationCreateInput, JRICalculationUncheckedCreateInput>
  }

  /**
   * JRICalculation createMany
   */
  export type JRICalculationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JRICalculations.
     */
    data: JRICalculationCreateManyInput | JRICalculationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JRICalculation createManyAndReturn
   */
  export type JRICalculationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * The data used to create many JRICalculations.
     */
    data: JRICalculationCreateManyInput | JRICalculationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * JRICalculation update
   */
  export type JRICalculationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * The data needed to update a JRICalculation.
     */
    data: XOR<JRICalculationUpdateInput, JRICalculationUncheckedUpdateInput>
    /**
     * Choose, which JRICalculation to update.
     */
    where: JRICalculationWhereUniqueInput
  }

  /**
   * JRICalculation updateMany
   */
  export type JRICalculationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JRICalculations.
     */
    data: XOR<JRICalculationUpdateManyMutationInput, JRICalculationUncheckedUpdateManyInput>
    /**
     * Filter which JRICalculations to update
     */
    where?: JRICalculationWhereInput
    /**
     * Limit how many JRICalculations to update.
     */
    limit?: number
  }

  /**
   * JRICalculation updateManyAndReturn
   */
  export type JRICalculationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * The data used to update JRICalculations.
     */
    data: XOR<JRICalculationUpdateManyMutationInput, JRICalculationUncheckedUpdateManyInput>
    /**
     * Filter which JRICalculations to update
     */
    where?: JRICalculationWhereInput
    /**
     * Limit how many JRICalculations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * JRICalculation upsert
   */
  export type JRICalculationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * The filter to search for the JRICalculation to update in case it exists.
     */
    where: JRICalculationWhereUniqueInput
    /**
     * In case the JRICalculation found by the `where` argument doesn't exist, create a new JRICalculation with this data.
     */
    create: XOR<JRICalculationCreateInput, JRICalculationUncheckedCreateInput>
    /**
     * In case the JRICalculation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JRICalculationUpdateInput, JRICalculationUncheckedUpdateInput>
  }

  /**
   * JRICalculation delete
   */
  export type JRICalculationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
    /**
     * Filter which JRICalculation to delete.
     */
    where: JRICalculationWhereUniqueInput
  }

  /**
   * JRICalculation deleteMany
   */
  export type JRICalculationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JRICalculations to delete
     */
    where?: JRICalculationWhereInput
    /**
     * Limit how many JRICalculations to delete.
     */
    limit?: number
  }

  /**
   * JRICalculation without action
   */
  export type JRICalculationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JRICalculation
     */
    select?: JRICalculationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the JRICalculation
     */
    omit?: JRICalculationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JRICalculationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    role: 'role',
    isActive: 'isActive',
    collegeId: 'collegeId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastLoginAt: 'lastLoginAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const CollegeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    shortName: 'shortName',
    domain: 'domain',
    location: 'location',
    website: 'website',
    settings: 'settings',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CollegeScalarFieldEnum = (typeof CollegeScalarFieldEnum)[keyof typeof CollegeScalarFieldEnum]


  export const StudentScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    collegeId: 'collegeId',
    firstName: 'firstName',
    lastName: 'lastName',
    rollNumber: 'rollNumber',
    email: 'email',
    phone: 'phone',
    department: 'department',
    semester: 'semester',
    batch: 'batch',
    section: 'section',
    isPlaced: 'isPlaced',
    placementYear: 'placementYear',
    packageOffered: 'packageOffered',
    companyName: 'companyName',
    githubUsername: 'githubUsername',
    githubAccessToken: 'githubAccessToken',
    githubConnectedAt: 'githubConnectedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StudentScalarFieldEnum = (typeof StudentScalarFieldEnum)[keyof typeof StudentScalarFieldEnum]


  export const GitHubProfileScalarFieldEnum: {
    id: 'id',
    studentId: 'studentId',
    username: 'username',
    profileUrl: 'profileUrl',
    totalRepos: 'totalRepos',
    totalCommits: 'totalCommits',
    totalStars: 'totalStars',
    totalForks: 'totalForks',
    languagesUsed: 'languagesUsed',
    frameworks: 'frameworks',
    repositories: 'repositories',
    lastFetchedAt: 'lastFetchedAt',
    fetchStatus: 'fetchStatus',
    errorMessage: 'errorMessage',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GitHubProfileScalarFieldEnum = (typeof GitHubProfileScalarFieldEnum)[keyof typeof GitHubProfileScalarFieldEnum]


  export const DSAProfileScalarFieldEnum: {
    id: 'id',
    studentId: 'studentId',
    platform: 'platform',
    username: 'username',
    profileUrl: 'profileUrl',
    totalSolved: 'totalSolved',
    easySolved: 'easySolved',
    mediumSolved: 'mediumSolved',
    hardSolved: 'hardSolved',
    rating: 'rating',
    lastFetchedAt: 'lastFetchedAt',
    fetchStatus: 'fetchStatus',
    errorMessage: 'errorMessage',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DSAProfileScalarFieldEnum = (typeof DSAProfileScalarFieldEnum)[keyof typeof DSAProfileScalarFieldEnum]


  export const JRICalculationScalarFieldEnum: {
    id: 'id',
    studentId: 'studentId',
    jriScore: 'jriScore',
    githubScore: 'githubScore',
    dsaScore: 'dsaScore',
    academicScore: 'academicScore',
    hackathonScore: 'hackathonScore',
    weights: 'weights',
    rawScores: 'rawScores',
    algorithmVersion: 'algorithmVersion',
    createdAt: 'createdAt'
  };

  export type JRICalculationScalarFieldEnum = (typeof JRICalculationScalarFieldEnum)[keyof typeof JRICalculationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'FetchStatus'
   */
  export type EnumFetchStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FetchStatus'>
    


  /**
   * Reference to a field of type 'FetchStatus[]'
   */
  export type ListEnumFetchStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FetchStatus[]'>
    


  /**
   * Reference to a field of type 'Platform'
   */
  export type EnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform'>
    


  /**
   * Reference to a field of type 'Platform[]'
   */
  export type ListEnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    collegeId?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    college?: XOR<CollegeNullableScalarRelationFilter, CollegeWhereInput> | null
    student?: XOR<StudentNullableScalarRelationFilter, StudentWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    collegeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    college?: CollegeOrderByWithRelationInput
    student?: StudentOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    collegeId?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    college?: XOR<CollegeNullableScalarRelationFilter, CollegeWhereInput> | null
    student?: XOR<StudentNullableScalarRelationFilter, StudentWhereInput> | null
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    collegeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    collegeId?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
  }

  export type CollegeWhereInput = {
    AND?: CollegeWhereInput | CollegeWhereInput[]
    OR?: CollegeWhereInput[]
    NOT?: CollegeWhereInput | CollegeWhereInput[]
    id?: StringFilter<"College"> | string
    name?: StringFilter<"College"> | string
    shortName?: StringFilter<"College"> | string
    domain?: StringNullableFilter<"College"> | string | null
    location?: StringNullableFilter<"College"> | string | null
    website?: StringNullableFilter<"College"> | string | null
    settings?: JsonNullableFilter<"College">
    createdAt?: DateTimeFilter<"College"> | Date | string
    updatedAt?: DateTimeFilter<"College"> | Date | string
    students?: StudentListRelationFilter
    users?: UserListRelationFilter
  }

  export type CollegeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    shortName?: SortOrder
    domain?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    settings?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    students?: StudentOrderByRelationAggregateInput
    users?: UserOrderByRelationAggregateInput
  }

  export type CollegeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    shortName?: string
    AND?: CollegeWhereInput | CollegeWhereInput[]
    OR?: CollegeWhereInput[]
    NOT?: CollegeWhereInput | CollegeWhereInput[]
    name?: StringFilter<"College"> | string
    domain?: StringNullableFilter<"College"> | string | null
    location?: StringNullableFilter<"College"> | string | null
    website?: StringNullableFilter<"College"> | string | null
    settings?: JsonNullableFilter<"College">
    createdAt?: DateTimeFilter<"College"> | Date | string
    updatedAt?: DateTimeFilter<"College"> | Date | string
    students?: StudentListRelationFilter
    users?: UserListRelationFilter
  }, "id" | "shortName">

  export type CollegeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    shortName?: SortOrder
    domain?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    settings?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CollegeCountOrderByAggregateInput
    _max?: CollegeMaxOrderByAggregateInput
    _min?: CollegeMinOrderByAggregateInput
  }

  export type CollegeScalarWhereWithAggregatesInput = {
    AND?: CollegeScalarWhereWithAggregatesInput | CollegeScalarWhereWithAggregatesInput[]
    OR?: CollegeScalarWhereWithAggregatesInput[]
    NOT?: CollegeScalarWhereWithAggregatesInput | CollegeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"College"> | string
    name?: StringWithAggregatesFilter<"College"> | string
    shortName?: StringWithAggregatesFilter<"College"> | string
    domain?: StringNullableWithAggregatesFilter<"College"> | string | null
    location?: StringNullableWithAggregatesFilter<"College"> | string | null
    website?: StringNullableWithAggregatesFilter<"College"> | string | null
    settings?: JsonNullableWithAggregatesFilter<"College">
    createdAt?: DateTimeWithAggregatesFilter<"College"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"College"> | Date | string
  }

  export type StudentWhereInput = {
    AND?: StudentWhereInput | StudentWhereInput[]
    OR?: StudentWhereInput[]
    NOT?: StudentWhereInput | StudentWhereInput[]
    id?: StringFilter<"Student"> | string
    userId?: StringFilter<"Student"> | string
    collegeId?: StringNullableFilter<"Student"> | string | null
    firstName?: StringFilter<"Student"> | string
    lastName?: StringFilter<"Student"> | string
    rollNumber?: StringFilter<"Student"> | string
    email?: StringFilter<"Student"> | string
    phone?: StringNullableFilter<"Student"> | string | null
    department?: StringFilter<"Student"> | string
    semester?: IntFilter<"Student"> | number
    batch?: StringFilter<"Student"> | string
    section?: StringNullableFilter<"Student"> | string | null
    isPlaced?: BoolFilter<"Student"> | boolean
    placementYear?: IntNullableFilter<"Student"> | number | null
    packageOffered?: FloatNullableFilter<"Student"> | number | null
    companyName?: StringNullableFilter<"Student"> | string | null
    githubUsername?: StringNullableFilter<"Student"> | string | null
    githubAccessToken?: StringNullableFilter<"Student"> | string | null
    githubConnectedAt?: DateTimeNullableFilter<"Student"> | Date | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
    updatedAt?: DateTimeFilter<"Student"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    college?: XOR<CollegeNullableScalarRelationFilter, CollegeWhereInput> | null
    githubProfile?: XOR<GitHubProfileNullableScalarRelationFilter, GitHubProfileWhereInput> | null
    dsaProfiles?: DSAProfileListRelationFilter
    jriCalculations?: JRICalculationListRelationFilter
  }

  export type StudentOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    collegeId?: SortOrderInput | SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    rollNumber?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    department?: SortOrder
    semester?: SortOrder
    batch?: SortOrder
    section?: SortOrderInput | SortOrder
    isPlaced?: SortOrder
    placementYear?: SortOrderInput | SortOrder
    packageOffered?: SortOrderInput | SortOrder
    companyName?: SortOrderInput | SortOrder
    githubUsername?: SortOrderInput | SortOrder
    githubAccessToken?: SortOrderInput | SortOrder
    githubConnectedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    college?: CollegeOrderByWithRelationInput
    githubProfile?: GitHubProfileOrderByWithRelationInput
    dsaProfiles?: DSAProfileOrderByRelationAggregateInput
    jriCalculations?: JRICalculationOrderByRelationAggregateInput
  }

  export type StudentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    email?: string
    githubUsername?: string
    AND?: StudentWhereInput | StudentWhereInput[]
    OR?: StudentWhereInput[]
    NOT?: StudentWhereInput | StudentWhereInput[]
    collegeId?: StringNullableFilter<"Student"> | string | null
    firstName?: StringFilter<"Student"> | string
    lastName?: StringFilter<"Student"> | string
    rollNumber?: StringFilter<"Student"> | string
    phone?: StringNullableFilter<"Student"> | string | null
    department?: StringFilter<"Student"> | string
    semester?: IntFilter<"Student"> | number
    batch?: StringFilter<"Student"> | string
    section?: StringNullableFilter<"Student"> | string | null
    isPlaced?: BoolFilter<"Student"> | boolean
    placementYear?: IntNullableFilter<"Student"> | number | null
    packageOffered?: FloatNullableFilter<"Student"> | number | null
    companyName?: StringNullableFilter<"Student"> | string | null
    githubAccessToken?: StringNullableFilter<"Student"> | string | null
    githubConnectedAt?: DateTimeNullableFilter<"Student"> | Date | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
    updatedAt?: DateTimeFilter<"Student"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    college?: XOR<CollegeNullableScalarRelationFilter, CollegeWhereInput> | null
    githubProfile?: XOR<GitHubProfileNullableScalarRelationFilter, GitHubProfileWhereInput> | null
    dsaProfiles?: DSAProfileListRelationFilter
    jriCalculations?: JRICalculationListRelationFilter
  }, "id" | "userId" | "email" | "githubUsername">

  export type StudentOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    collegeId?: SortOrderInput | SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    rollNumber?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    department?: SortOrder
    semester?: SortOrder
    batch?: SortOrder
    section?: SortOrderInput | SortOrder
    isPlaced?: SortOrder
    placementYear?: SortOrderInput | SortOrder
    packageOffered?: SortOrderInput | SortOrder
    companyName?: SortOrderInput | SortOrder
    githubUsername?: SortOrderInput | SortOrder
    githubAccessToken?: SortOrderInput | SortOrder
    githubConnectedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StudentCountOrderByAggregateInput
    _avg?: StudentAvgOrderByAggregateInput
    _max?: StudentMaxOrderByAggregateInput
    _min?: StudentMinOrderByAggregateInput
    _sum?: StudentSumOrderByAggregateInput
  }

  export type StudentScalarWhereWithAggregatesInput = {
    AND?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[]
    OR?: StudentScalarWhereWithAggregatesInput[]
    NOT?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Student"> | string
    userId?: StringWithAggregatesFilter<"Student"> | string
    collegeId?: StringNullableWithAggregatesFilter<"Student"> | string | null
    firstName?: StringWithAggregatesFilter<"Student"> | string
    lastName?: StringWithAggregatesFilter<"Student"> | string
    rollNumber?: StringWithAggregatesFilter<"Student"> | string
    email?: StringWithAggregatesFilter<"Student"> | string
    phone?: StringNullableWithAggregatesFilter<"Student"> | string | null
    department?: StringWithAggregatesFilter<"Student"> | string
    semester?: IntWithAggregatesFilter<"Student"> | number
    batch?: StringWithAggregatesFilter<"Student"> | string
    section?: StringNullableWithAggregatesFilter<"Student"> | string | null
    isPlaced?: BoolWithAggregatesFilter<"Student"> | boolean
    placementYear?: IntNullableWithAggregatesFilter<"Student"> | number | null
    packageOffered?: FloatNullableWithAggregatesFilter<"Student"> | number | null
    companyName?: StringNullableWithAggregatesFilter<"Student"> | string | null
    githubUsername?: StringNullableWithAggregatesFilter<"Student"> | string | null
    githubAccessToken?: StringNullableWithAggregatesFilter<"Student"> | string | null
    githubConnectedAt?: DateTimeNullableWithAggregatesFilter<"Student"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Student"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Student"> | Date | string
  }

  export type GitHubProfileWhereInput = {
    AND?: GitHubProfileWhereInput | GitHubProfileWhereInput[]
    OR?: GitHubProfileWhereInput[]
    NOT?: GitHubProfileWhereInput | GitHubProfileWhereInput[]
    id?: StringFilter<"GitHubProfile"> | string
    studentId?: StringFilter<"GitHubProfile"> | string
    username?: StringFilter<"GitHubProfile"> | string
    profileUrl?: StringFilter<"GitHubProfile"> | string
    totalRepos?: IntFilter<"GitHubProfile"> | number
    totalCommits?: IntFilter<"GitHubProfile"> | number
    totalStars?: IntFilter<"GitHubProfile"> | number
    totalForks?: IntFilter<"GitHubProfile"> | number
    languagesUsed?: JsonFilter<"GitHubProfile">
    frameworks?: JsonFilter<"GitHubProfile">
    repositories?: JsonFilter<"GitHubProfile">
    lastFetchedAt?: DateTimeNullableFilter<"GitHubProfile"> | Date | string | null
    fetchStatus?: EnumFetchStatusFilter<"GitHubProfile"> | $Enums.FetchStatus
    errorMessage?: StringNullableFilter<"GitHubProfile"> | string | null
    createdAt?: DateTimeFilter<"GitHubProfile"> | Date | string
    updatedAt?: DateTimeFilter<"GitHubProfile"> | Date | string
    student?: XOR<StudentScalarRelationFilter, StudentWhereInput>
  }

  export type GitHubProfileOrderByWithRelationInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalRepos?: SortOrder
    totalCommits?: SortOrder
    totalStars?: SortOrder
    totalForks?: SortOrder
    languagesUsed?: SortOrder
    frameworks?: SortOrder
    repositories?: SortOrder
    lastFetchedAt?: SortOrderInput | SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    student?: StudentOrderByWithRelationInput
  }

  export type GitHubProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    studentId?: string
    username?: string
    AND?: GitHubProfileWhereInput | GitHubProfileWhereInput[]
    OR?: GitHubProfileWhereInput[]
    NOT?: GitHubProfileWhereInput | GitHubProfileWhereInput[]
    profileUrl?: StringFilter<"GitHubProfile"> | string
    totalRepos?: IntFilter<"GitHubProfile"> | number
    totalCommits?: IntFilter<"GitHubProfile"> | number
    totalStars?: IntFilter<"GitHubProfile"> | number
    totalForks?: IntFilter<"GitHubProfile"> | number
    languagesUsed?: JsonFilter<"GitHubProfile">
    frameworks?: JsonFilter<"GitHubProfile">
    repositories?: JsonFilter<"GitHubProfile">
    lastFetchedAt?: DateTimeNullableFilter<"GitHubProfile"> | Date | string | null
    fetchStatus?: EnumFetchStatusFilter<"GitHubProfile"> | $Enums.FetchStatus
    errorMessage?: StringNullableFilter<"GitHubProfile"> | string | null
    createdAt?: DateTimeFilter<"GitHubProfile"> | Date | string
    updatedAt?: DateTimeFilter<"GitHubProfile"> | Date | string
    student?: XOR<StudentScalarRelationFilter, StudentWhereInput>
  }, "id" | "studentId" | "username">

  export type GitHubProfileOrderByWithAggregationInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalRepos?: SortOrder
    totalCommits?: SortOrder
    totalStars?: SortOrder
    totalForks?: SortOrder
    languagesUsed?: SortOrder
    frameworks?: SortOrder
    repositories?: SortOrder
    lastFetchedAt?: SortOrderInput | SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GitHubProfileCountOrderByAggregateInput
    _avg?: GitHubProfileAvgOrderByAggregateInput
    _max?: GitHubProfileMaxOrderByAggregateInput
    _min?: GitHubProfileMinOrderByAggregateInput
    _sum?: GitHubProfileSumOrderByAggregateInput
  }

  export type GitHubProfileScalarWhereWithAggregatesInput = {
    AND?: GitHubProfileScalarWhereWithAggregatesInput | GitHubProfileScalarWhereWithAggregatesInput[]
    OR?: GitHubProfileScalarWhereWithAggregatesInput[]
    NOT?: GitHubProfileScalarWhereWithAggregatesInput | GitHubProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GitHubProfile"> | string
    studentId?: StringWithAggregatesFilter<"GitHubProfile"> | string
    username?: StringWithAggregatesFilter<"GitHubProfile"> | string
    profileUrl?: StringWithAggregatesFilter<"GitHubProfile"> | string
    totalRepos?: IntWithAggregatesFilter<"GitHubProfile"> | number
    totalCommits?: IntWithAggregatesFilter<"GitHubProfile"> | number
    totalStars?: IntWithAggregatesFilter<"GitHubProfile"> | number
    totalForks?: IntWithAggregatesFilter<"GitHubProfile"> | number
    languagesUsed?: JsonWithAggregatesFilter<"GitHubProfile">
    frameworks?: JsonWithAggregatesFilter<"GitHubProfile">
    repositories?: JsonWithAggregatesFilter<"GitHubProfile">
    lastFetchedAt?: DateTimeNullableWithAggregatesFilter<"GitHubProfile"> | Date | string | null
    fetchStatus?: EnumFetchStatusWithAggregatesFilter<"GitHubProfile"> | $Enums.FetchStatus
    errorMessage?: StringNullableWithAggregatesFilter<"GitHubProfile"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"GitHubProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GitHubProfile"> | Date | string
  }

  export type DSAProfileWhereInput = {
    AND?: DSAProfileWhereInput | DSAProfileWhereInput[]
    OR?: DSAProfileWhereInput[]
    NOT?: DSAProfileWhereInput | DSAProfileWhereInput[]
    id?: StringFilter<"DSAProfile"> | string
    studentId?: StringFilter<"DSAProfile"> | string
    platform?: EnumPlatformFilter<"DSAProfile"> | $Enums.Platform
    username?: StringFilter<"DSAProfile"> | string
    profileUrl?: StringFilter<"DSAProfile"> | string
    totalSolved?: IntFilter<"DSAProfile"> | number
    easySolved?: IntFilter<"DSAProfile"> | number
    mediumSolved?: IntFilter<"DSAProfile"> | number
    hardSolved?: IntFilter<"DSAProfile"> | number
    rating?: FloatNullableFilter<"DSAProfile"> | number | null
    lastFetchedAt?: DateTimeNullableFilter<"DSAProfile"> | Date | string | null
    fetchStatus?: EnumFetchStatusFilter<"DSAProfile"> | $Enums.FetchStatus
    errorMessage?: StringNullableFilter<"DSAProfile"> | string | null
    createdAt?: DateTimeFilter<"DSAProfile"> | Date | string
    updatedAt?: DateTimeFilter<"DSAProfile"> | Date | string
    student?: XOR<StudentScalarRelationFilter, StudentWhereInput>
  }

  export type DSAProfileOrderByWithRelationInput = {
    id?: SortOrder
    studentId?: SortOrder
    platform?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalSolved?: SortOrder
    easySolved?: SortOrder
    mediumSolved?: SortOrder
    hardSolved?: SortOrder
    rating?: SortOrderInput | SortOrder
    lastFetchedAt?: SortOrderInput | SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    student?: StudentOrderByWithRelationInput
  }

  export type DSAProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    studentId_platform?: DSAProfileStudentIdPlatformCompoundUniqueInput
    AND?: DSAProfileWhereInput | DSAProfileWhereInput[]
    OR?: DSAProfileWhereInput[]
    NOT?: DSAProfileWhereInput | DSAProfileWhereInput[]
    studentId?: StringFilter<"DSAProfile"> | string
    platform?: EnumPlatformFilter<"DSAProfile"> | $Enums.Platform
    username?: StringFilter<"DSAProfile"> | string
    profileUrl?: StringFilter<"DSAProfile"> | string
    totalSolved?: IntFilter<"DSAProfile"> | number
    easySolved?: IntFilter<"DSAProfile"> | number
    mediumSolved?: IntFilter<"DSAProfile"> | number
    hardSolved?: IntFilter<"DSAProfile"> | number
    rating?: FloatNullableFilter<"DSAProfile"> | number | null
    lastFetchedAt?: DateTimeNullableFilter<"DSAProfile"> | Date | string | null
    fetchStatus?: EnumFetchStatusFilter<"DSAProfile"> | $Enums.FetchStatus
    errorMessage?: StringNullableFilter<"DSAProfile"> | string | null
    createdAt?: DateTimeFilter<"DSAProfile"> | Date | string
    updatedAt?: DateTimeFilter<"DSAProfile"> | Date | string
    student?: XOR<StudentScalarRelationFilter, StudentWhereInput>
  }, "id" | "studentId_platform">

  export type DSAProfileOrderByWithAggregationInput = {
    id?: SortOrder
    studentId?: SortOrder
    platform?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalSolved?: SortOrder
    easySolved?: SortOrder
    mediumSolved?: SortOrder
    hardSolved?: SortOrder
    rating?: SortOrderInput | SortOrder
    lastFetchedAt?: SortOrderInput | SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DSAProfileCountOrderByAggregateInput
    _avg?: DSAProfileAvgOrderByAggregateInput
    _max?: DSAProfileMaxOrderByAggregateInput
    _min?: DSAProfileMinOrderByAggregateInput
    _sum?: DSAProfileSumOrderByAggregateInput
  }

  export type DSAProfileScalarWhereWithAggregatesInput = {
    AND?: DSAProfileScalarWhereWithAggregatesInput | DSAProfileScalarWhereWithAggregatesInput[]
    OR?: DSAProfileScalarWhereWithAggregatesInput[]
    NOT?: DSAProfileScalarWhereWithAggregatesInput | DSAProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DSAProfile"> | string
    studentId?: StringWithAggregatesFilter<"DSAProfile"> | string
    platform?: EnumPlatformWithAggregatesFilter<"DSAProfile"> | $Enums.Platform
    username?: StringWithAggregatesFilter<"DSAProfile"> | string
    profileUrl?: StringWithAggregatesFilter<"DSAProfile"> | string
    totalSolved?: IntWithAggregatesFilter<"DSAProfile"> | number
    easySolved?: IntWithAggregatesFilter<"DSAProfile"> | number
    mediumSolved?: IntWithAggregatesFilter<"DSAProfile"> | number
    hardSolved?: IntWithAggregatesFilter<"DSAProfile"> | number
    rating?: FloatNullableWithAggregatesFilter<"DSAProfile"> | number | null
    lastFetchedAt?: DateTimeNullableWithAggregatesFilter<"DSAProfile"> | Date | string | null
    fetchStatus?: EnumFetchStatusWithAggregatesFilter<"DSAProfile"> | $Enums.FetchStatus
    errorMessage?: StringNullableWithAggregatesFilter<"DSAProfile"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DSAProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DSAProfile"> | Date | string
  }

  export type JRICalculationWhereInput = {
    AND?: JRICalculationWhereInput | JRICalculationWhereInput[]
    OR?: JRICalculationWhereInput[]
    NOT?: JRICalculationWhereInput | JRICalculationWhereInput[]
    id?: StringFilter<"JRICalculation"> | string
    studentId?: StringFilter<"JRICalculation"> | string
    jriScore?: FloatFilter<"JRICalculation"> | number
    githubScore?: FloatFilter<"JRICalculation"> | number
    dsaScore?: FloatFilter<"JRICalculation"> | number
    academicScore?: FloatFilter<"JRICalculation"> | number
    hackathonScore?: FloatFilter<"JRICalculation"> | number
    weights?: JsonFilter<"JRICalculation">
    rawScores?: JsonFilter<"JRICalculation">
    algorithmVersion?: StringFilter<"JRICalculation"> | string
    createdAt?: DateTimeFilter<"JRICalculation"> | Date | string
    student?: XOR<StudentScalarRelationFilter, StudentWhereInput>
  }

  export type JRICalculationOrderByWithRelationInput = {
    id?: SortOrder
    studentId?: SortOrder
    jriScore?: SortOrder
    githubScore?: SortOrder
    dsaScore?: SortOrder
    academicScore?: SortOrder
    hackathonScore?: SortOrder
    weights?: SortOrder
    rawScores?: SortOrder
    algorithmVersion?: SortOrder
    createdAt?: SortOrder
    student?: StudentOrderByWithRelationInput
  }

  export type JRICalculationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: JRICalculationWhereInput | JRICalculationWhereInput[]
    OR?: JRICalculationWhereInput[]
    NOT?: JRICalculationWhereInput | JRICalculationWhereInput[]
    studentId?: StringFilter<"JRICalculation"> | string
    jriScore?: FloatFilter<"JRICalculation"> | number
    githubScore?: FloatFilter<"JRICalculation"> | number
    dsaScore?: FloatFilter<"JRICalculation"> | number
    academicScore?: FloatFilter<"JRICalculation"> | number
    hackathonScore?: FloatFilter<"JRICalculation"> | number
    weights?: JsonFilter<"JRICalculation">
    rawScores?: JsonFilter<"JRICalculation">
    algorithmVersion?: StringFilter<"JRICalculation"> | string
    createdAt?: DateTimeFilter<"JRICalculation"> | Date | string
    student?: XOR<StudentScalarRelationFilter, StudentWhereInput>
  }, "id">

  export type JRICalculationOrderByWithAggregationInput = {
    id?: SortOrder
    studentId?: SortOrder
    jriScore?: SortOrder
    githubScore?: SortOrder
    dsaScore?: SortOrder
    academicScore?: SortOrder
    hackathonScore?: SortOrder
    weights?: SortOrder
    rawScores?: SortOrder
    algorithmVersion?: SortOrder
    createdAt?: SortOrder
    _count?: JRICalculationCountOrderByAggregateInput
    _avg?: JRICalculationAvgOrderByAggregateInput
    _max?: JRICalculationMaxOrderByAggregateInput
    _min?: JRICalculationMinOrderByAggregateInput
    _sum?: JRICalculationSumOrderByAggregateInput
  }

  export type JRICalculationScalarWhereWithAggregatesInput = {
    AND?: JRICalculationScalarWhereWithAggregatesInput | JRICalculationScalarWhereWithAggregatesInput[]
    OR?: JRICalculationScalarWhereWithAggregatesInput[]
    NOT?: JRICalculationScalarWhereWithAggregatesInput | JRICalculationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"JRICalculation"> | string
    studentId?: StringWithAggregatesFilter<"JRICalculation"> | string
    jriScore?: FloatWithAggregatesFilter<"JRICalculation"> | number
    githubScore?: FloatWithAggregatesFilter<"JRICalculation"> | number
    dsaScore?: FloatWithAggregatesFilter<"JRICalculation"> | number
    academicScore?: FloatWithAggregatesFilter<"JRICalculation"> | number
    hackathonScore?: FloatWithAggregatesFilter<"JRICalculation"> | number
    weights?: JsonWithAggregatesFilter<"JRICalculation">
    rawScores?: JsonWithAggregatesFilter<"JRICalculation">
    algorithmVersion?: StringWithAggregatesFilter<"JRICalculation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"JRICalculation"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    college?: CollegeCreateNestedOneWithoutUsersInput
    student?: StudentCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    collegeId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    student?: StudentUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    college?: CollegeUpdateOneWithoutUsersNestedInput
    student?: StudentUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    student?: StudentUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    collegeId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CollegeCreateInput = {
    id?: string
    name: string
    shortName: string
    domain?: string | null
    location?: string | null
    website?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    students?: StudentCreateNestedManyWithoutCollegeInput
    users?: UserCreateNestedManyWithoutCollegeInput
  }

  export type CollegeUncheckedCreateInput = {
    id?: string
    name: string
    shortName: string
    domain?: string | null
    location?: string | null
    website?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    students?: StudentUncheckedCreateNestedManyWithoutCollegeInput
    users?: UserUncheckedCreateNestedManyWithoutCollegeInput
  }

  export type CollegeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    students?: StudentUpdateManyWithoutCollegeNestedInput
    users?: UserUpdateManyWithoutCollegeNestedInput
  }

  export type CollegeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    students?: StudentUncheckedUpdateManyWithoutCollegeNestedInput
    users?: UserUncheckedUpdateManyWithoutCollegeNestedInput
  }

  export type CollegeCreateManyInput = {
    id?: string
    name: string
    shortName: string
    domain?: string | null
    location?: string | null
    website?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CollegeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CollegeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StudentCreateInput = {
    id?: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutStudentInput
    college?: CollegeCreateNestedOneWithoutStudentsInput
    githubProfile?: GitHubProfileCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationCreateNestedManyWithoutStudentInput
  }

  export type StudentUncheckedCreateInput = {
    id?: string
    userId: string
    collegeId?: string | null
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    githubProfile?: GitHubProfileUncheckedCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileUncheckedCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutStudentNestedInput
    college?: CollegeUpdateOneWithoutStudentsNestedInput
    githubProfile?: GitHubProfileUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    githubProfile?: GitHubProfileUncheckedUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUncheckedUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateManyInput = {
    id?: string
    userId: string
    collegeId?: string | null
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StudentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StudentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GitHubProfileCreateInput = {
    id?: string
    username: string
    profileUrl: string
    totalRepos?: number
    totalCommits?: number
    totalStars?: number
    totalForks?: number
    languagesUsed: JsonNullValueInput | InputJsonValue
    frameworks: JsonNullValueInput | InputJsonValue
    repositories: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    student: StudentCreateNestedOneWithoutGithubProfileInput
  }

  export type GitHubProfileUncheckedCreateInput = {
    id?: string
    studentId: string
    username: string
    profileUrl: string
    totalRepos?: number
    totalCommits?: number
    totalStars?: number
    totalForks?: number
    languagesUsed: JsonNullValueInput | InputJsonValue
    frameworks: JsonNullValueInput | InputJsonValue
    repositories: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GitHubProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalRepos?: IntFieldUpdateOperationsInput | number
    totalCommits?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    totalForks?: IntFieldUpdateOperationsInput | number
    languagesUsed?: JsonNullValueInput | InputJsonValue
    frameworks?: JsonNullValueInput | InputJsonValue
    repositories?: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutGithubProfileNestedInput
  }

  export type GitHubProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalRepos?: IntFieldUpdateOperationsInput | number
    totalCommits?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    totalForks?: IntFieldUpdateOperationsInput | number
    languagesUsed?: JsonNullValueInput | InputJsonValue
    frameworks?: JsonNullValueInput | InputJsonValue
    repositories?: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GitHubProfileCreateManyInput = {
    id?: string
    studentId: string
    username: string
    profileUrl: string
    totalRepos?: number
    totalCommits?: number
    totalStars?: number
    totalForks?: number
    languagesUsed: JsonNullValueInput | InputJsonValue
    frameworks: JsonNullValueInput | InputJsonValue
    repositories: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GitHubProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalRepos?: IntFieldUpdateOperationsInput | number
    totalCommits?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    totalForks?: IntFieldUpdateOperationsInput | number
    languagesUsed?: JsonNullValueInput | InputJsonValue
    frameworks?: JsonNullValueInput | InputJsonValue
    repositories?: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GitHubProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalRepos?: IntFieldUpdateOperationsInput | number
    totalCommits?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    totalForks?: IntFieldUpdateOperationsInput | number
    languagesUsed?: JsonNullValueInput | InputJsonValue
    frameworks?: JsonNullValueInput | InputJsonValue
    repositories?: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DSAProfileCreateInput = {
    id?: string
    platform: $Enums.Platform
    username: string
    profileUrl: string
    totalSolved?: number
    easySolved?: number
    mediumSolved?: number
    hardSolved?: number
    rating?: number | null
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    student: StudentCreateNestedOneWithoutDsaProfilesInput
  }

  export type DSAProfileUncheckedCreateInput = {
    id?: string
    studentId: string
    platform: $Enums.Platform
    username: string
    profileUrl: string
    totalSolved?: number
    easySolved?: number
    mediumSolved?: number
    hardSolved?: number
    rating?: number | null
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DSAProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalSolved?: IntFieldUpdateOperationsInput | number
    easySolved?: IntFieldUpdateOperationsInput | number
    mediumSolved?: IntFieldUpdateOperationsInput | number
    hardSolved?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutDsaProfilesNestedInput
  }

  export type DSAProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalSolved?: IntFieldUpdateOperationsInput | number
    easySolved?: IntFieldUpdateOperationsInput | number
    mediumSolved?: IntFieldUpdateOperationsInput | number
    hardSolved?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DSAProfileCreateManyInput = {
    id?: string
    studentId: string
    platform: $Enums.Platform
    username: string
    profileUrl: string
    totalSolved?: number
    easySolved?: number
    mediumSolved?: number
    hardSolved?: number
    rating?: number | null
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DSAProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalSolved?: IntFieldUpdateOperationsInput | number
    easySolved?: IntFieldUpdateOperationsInput | number
    mediumSolved?: IntFieldUpdateOperationsInput | number
    hardSolved?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DSAProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalSolved?: IntFieldUpdateOperationsInput | number
    easySolved?: IntFieldUpdateOperationsInput | number
    mediumSolved?: IntFieldUpdateOperationsInput | number
    hardSolved?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JRICalculationCreateInput = {
    id?: string
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: JsonNullValueInput | InputJsonValue
    rawScores: JsonNullValueInput | InputJsonValue
    algorithmVersion: string
    createdAt?: Date | string
    student: StudentCreateNestedOneWithoutJriCalculationsInput
  }

  export type JRICalculationUncheckedCreateInput = {
    id?: string
    studentId: string
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: JsonNullValueInput | InputJsonValue
    rawScores: JsonNullValueInput | InputJsonValue
    algorithmVersion: string
    createdAt?: Date | string
  }

  export type JRICalculationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jriScore?: FloatFieldUpdateOperationsInput | number
    githubScore?: FloatFieldUpdateOperationsInput | number
    dsaScore?: FloatFieldUpdateOperationsInput | number
    academicScore?: FloatFieldUpdateOperationsInput | number
    hackathonScore?: FloatFieldUpdateOperationsInput | number
    weights?: JsonNullValueInput | InputJsonValue
    rawScores?: JsonNullValueInput | InputJsonValue
    algorithmVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutJriCalculationsNestedInput
  }

  export type JRICalculationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    jriScore?: FloatFieldUpdateOperationsInput | number
    githubScore?: FloatFieldUpdateOperationsInput | number
    dsaScore?: FloatFieldUpdateOperationsInput | number
    academicScore?: FloatFieldUpdateOperationsInput | number
    hackathonScore?: FloatFieldUpdateOperationsInput | number
    weights?: JsonNullValueInput | InputJsonValue
    rawScores?: JsonNullValueInput | InputJsonValue
    algorithmVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JRICalculationCreateManyInput = {
    id?: string
    studentId: string
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: JsonNullValueInput | InputJsonValue
    rawScores: JsonNullValueInput | InputJsonValue
    algorithmVersion: string
    createdAt?: Date | string
  }

  export type JRICalculationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jriScore?: FloatFieldUpdateOperationsInput | number
    githubScore?: FloatFieldUpdateOperationsInput | number
    dsaScore?: FloatFieldUpdateOperationsInput | number
    academicScore?: FloatFieldUpdateOperationsInput | number
    hackathonScore?: FloatFieldUpdateOperationsInput | number
    weights?: JsonNullValueInput | InputJsonValue
    rawScores?: JsonNullValueInput | InputJsonValue
    algorithmVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JRICalculationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    jriScore?: FloatFieldUpdateOperationsInput | number
    githubScore?: FloatFieldUpdateOperationsInput | number
    dsaScore?: FloatFieldUpdateOperationsInput | number
    academicScore?: FloatFieldUpdateOperationsInput | number
    hackathonScore?: FloatFieldUpdateOperationsInput | number
    weights?: JsonNullValueInput | InputJsonValue
    rawScores?: JsonNullValueInput | InputJsonValue
    algorithmVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type CollegeNullableScalarRelationFilter = {
    is?: CollegeWhereInput | null
    isNot?: CollegeWhereInput | null
  }

  export type StudentNullableScalarRelationFilter = {
    is?: StudentWhereInput | null
    isNot?: StudentWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    collegeId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    collegeId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    collegeId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StudentListRelationFilter = {
    every?: StudentWhereInput
    some?: StudentWhereInput
    none?: StudentWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type StudentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CollegeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    shortName?: SortOrder
    domain?: SortOrder
    location?: SortOrder
    website?: SortOrder
    settings?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CollegeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    shortName?: SortOrder
    domain?: SortOrder
    location?: SortOrder
    website?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CollegeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    shortName?: SortOrder
    domain?: SortOrder
    location?: SortOrder
    website?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type GitHubProfileNullableScalarRelationFilter = {
    is?: GitHubProfileWhereInput | null
    isNot?: GitHubProfileWhereInput | null
  }

  export type DSAProfileListRelationFilter = {
    every?: DSAProfileWhereInput
    some?: DSAProfileWhereInput
    none?: DSAProfileWhereInput
  }

  export type JRICalculationListRelationFilter = {
    every?: JRICalculationWhereInput
    some?: JRICalculationWhereInput
    none?: JRICalculationWhereInput
  }

  export type DSAProfileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type JRICalculationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StudentCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    collegeId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    rollNumber?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    department?: SortOrder
    semester?: SortOrder
    batch?: SortOrder
    section?: SortOrder
    isPlaced?: SortOrder
    placementYear?: SortOrder
    packageOffered?: SortOrder
    companyName?: SortOrder
    githubUsername?: SortOrder
    githubAccessToken?: SortOrder
    githubConnectedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StudentAvgOrderByAggregateInput = {
    semester?: SortOrder
    placementYear?: SortOrder
    packageOffered?: SortOrder
  }

  export type StudentMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    collegeId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    rollNumber?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    department?: SortOrder
    semester?: SortOrder
    batch?: SortOrder
    section?: SortOrder
    isPlaced?: SortOrder
    placementYear?: SortOrder
    packageOffered?: SortOrder
    companyName?: SortOrder
    githubUsername?: SortOrder
    githubAccessToken?: SortOrder
    githubConnectedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StudentMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    collegeId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    rollNumber?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    department?: SortOrder
    semester?: SortOrder
    batch?: SortOrder
    section?: SortOrder
    isPlaced?: SortOrder
    placementYear?: SortOrder
    packageOffered?: SortOrder
    companyName?: SortOrder
    githubUsername?: SortOrder
    githubAccessToken?: SortOrder
    githubConnectedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StudentSumOrderByAggregateInput = {
    semester?: SortOrder
    placementYear?: SortOrder
    packageOffered?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EnumFetchStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FetchStatus | EnumFetchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFetchStatusFilter<$PrismaModel> | $Enums.FetchStatus
  }

  export type StudentScalarRelationFilter = {
    is?: StudentWhereInput
    isNot?: StudentWhereInput
  }

  export type GitHubProfileCountOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalRepos?: SortOrder
    totalCommits?: SortOrder
    totalStars?: SortOrder
    totalForks?: SortOrder
    languagesUsed?: SortOrder
    frameworks?: SortOrder
    repositories?: SortOrder
    lastFetchedAt?: SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GitHubProfileAvgOrderByAggregateInput = {
    totalRepos?: SortOrder
    totalCommits?: SortOrder
    totalStars?: SortOrder
    totalForks?: SortOrder
  }

  export type GitHubProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalRepos?: SortOrder
    totalCommits?: SortOrder
    totalStars?: SortOrder
    totalForks?: SortOrder
    lastFetchedAt?: SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GitHubProfileMinOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalRepos?: SortOrder
    totalCommits?: SortOrder
    totalStars?: SortOrder
    totalForks?: SortOrder
    lastFetchedAt?: SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GitHubProfileSumOrderByAggregateInput = {
    totalRepos?: SortOrder
    totalCommits?: SortOrder
    totalStars?: SortOrder
    totalForks?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumFetchStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FetchStatus | EnumFetchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFetchStatusWithAggregatesFilter<$PrismaModel> | $Enums.FetchStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFetchStatusFilter<$PrismaModel>
    _max?: NestedEnumFetchStatusFilter<$PrismaModel>
  }

  export type EnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }

  export type DSAProfileStudentIdPlatformCompoundUniqueInput = {
    studentId: string
    platform: $Enums.Platform
  }

  export type DSAProfileCountOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    platform?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalSolved?: SortOrder
    easySolved?: SortOrder
    mediumSolved?: SortOrder
    hardSolved?: SortOrder
    rating?: SortOrder
    lastFetchedAt?: SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DSAProfileAvgOrderByAggregateInput = {
    totalSolved?: SortOrder
    easySolved?: SortOrder
    mediumSolved?: SortOrder
    hardSolved?: SortOrder
    rating?: SortOrder
  }

  export type DSAProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    platform?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalSolved?: SortOrder
    easySolved?: SortOrder
    mediumSolved?: SortOrder
    hardSolved?: SortOrder
    rating?: SortOrder
    lastFetchedAt?: SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DSAProfileMinOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    platform?: SortOrder
    username?: SortOrder
    profileUrl?: SortOrder
    totalSolved?: SortOrder
    easySolved?: SortOrder
    mediumSolved?: SortOrder
    hardSolved?: SortOrder
    rating?: SortOrder
    lastFetchedAt?: SortOrder
    fetchStatus?: SortOrder
    errorMessage?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DSAProfileSumOrderByAggregateInput = {
    totalSolved?: SortOrder
    easySolved?: SortOrder
    mediumSolved?: SortOrder
    hardSolved?: SortOrder
    rating?: SortOrder
  }

  export type EnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type JRICalculationCountOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    jriScore?: SortOrder
    githubScore?: SortOrder
    dsaScore?: SortOrder
    academicScore?: SortOrder
    hackathonScore?: SortOrder
    weights?: SortOrder
    rawScores?: SortOrder
    algorithmVersion?: SortOrder
    createdAt?: SortOrder
  }

  export type JRICalculationAvgOrderByAggregateInput = {
    jriScore?: SortOrder
    githubScore?: SortOrder
    dsaScore?: SortOrder
    academicScore?: SortOrder
    hackathonScore?: SortOrder
  }

  export type JRICalculationMaxOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    jriScore?: SortOrder
    githubScore?: SortOrder
    dsaScore?: SortOrder
    academicScore?: SortOrder
    hackathonScore?: SortOrder
    algorithmVersion?: SortOrder
    createdAt?: SortOrder
  }

  export type JRICalculationMinOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    jriScore?: SortOrder
    githubScore?: SortOrder
    dsaScore?: SortOrder
    academicScore?: SortOrder
    hackathonScore?: SortOrder
    algorithmVersion?: SortOrder
    createdAt?: SortOrder
  }

  export type JRICalculationSumOrderByAggregateInput = {
    jriScore?: SortOrder
    githubScore?: SortOrder
    dsaScore?: SortOrder
    academicScore?: SortOrder
    hackathonScore?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type CollegeCreateNestedOneWithoutUsersInput = {
    create?: XOR<CollegeCreateWithoutUsersInput, CollegeUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CollegeCreateOrConnectWithoutUsersInput
    connect?: CollegeWhereUniqueInput
  }

  export type StudentCreateNestedOneWithoutUserInput = {
    create?: XOR<StudentCreateWithoutUserInput, StudentUncheckedCreateWithoutUserInput>
    connectOrCreate?: StudentCreateOrConnectWithoutUserInput
    connect?: StudentWhereUniqueInput
  }

  export type StudentUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<StudentCreateWithoutUserInput, StudentUncheckedCreateWithoutUserInput>
    connectOrCreate?: StudentCreateOrConnectWithoutUserInput
    connect?: StudentWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type CollegeUpdateOneWithoutUsersNestedInput = {
    create?: XOR<CollegeCreateWithoutUsersInput, CollegeUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CollegeCreateOrConnectWithoutUsersInput
    upsert?: CollegeUpsertWithoutUsersInput
    disconnect?: CollegeWhereInput | boolean
    delete?: CollegeWhereInput | boolean
    connect?: CollegeWhereUniqueInput
    update?: XOR<XOR<CollegeUpdateToOneWithWhereWithoutUsersInput, CollegeUpdateWithoutUsersInput>, CollegeUncheckedUpdateWithoutUsersInput>
  }

  export type StudentUpdateOneWithoutUserNestedInput = {
    create?: XOR<StudentCreateWithoutUserInput, StudentUncheckedCreateWithoutUserInput>
    connectOrCreate?: StudentCreateOrConnectWithoutUserInput
    upsert?: StudentUpsertWithoutUserInput
    disconnect?: StudentWhereInput | boolean
    delete?: StudentWhereInput | boolean
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutUserInput, StudentUpdateWithoutUserInput>, StudentUncheckedUpdateWithoutUserInput>
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type StudentUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<StudentCreateWithoutUserInput, StudentUncheckedCreateWithoutUserInput>
    connectOrCreate?: StudentCreateOrConnectWithoutUserInput
    upsert?: StudentUpsertWithoutUserInput
    disconnect?: StudentWhereInput | boolean
    delete?: StudentWhereInput | boolean
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutUserInput, StudentUpdateWithoutUserInput>, StudentUncheckedUpdateWithoutUserInput>
  }

  export type StudentCreateNestedManyWithoutCollegeInput = {
    create?: XOR<StudentCreateWithoutCollegeInput, StudentUncheckedCreateWithoutCollegeInput> | StudentCreateWithoutCollegeInput[] | StudentUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutCollegeInput | StudentCreateOrConnectWithoutCollegeInput[]
    createMany?: StudentCreateManyCollegeInputEnvelope
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutCollegeInput = {
    create?: XOR<UserCreateWithoutCollegeInput, UserUncheckedCreateWithoutCollegeInput> | UserCreateWithoutCollegeInput[] | UserUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCollegeInput | UserCreateOrConnectWithoutCollegeInput[]
    createMany?: UserCreateManyCollegeInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StudentUncheckedCreateNestedManyWithoutCollegeInput = {
    create?: XOR<StudentCreateWithoutCollegeInput, StudentUncheckedCreateWithoutCollegeInput> | StudentCreateWithoutCollegeInput[] | StudentUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutCollegeInput | StudentCreateOrConnectWithoutCollegeInput[]
    createMany?: StudentCreateManyCollegeInputEnvelope
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutCollegeInput = {
    create?: XOR<UserCreateWithoutCollegeInput, UserUncheckedCreateWithoutCollegeInput> | UserCreateWithoutCollegeInput[] | UserUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCollegeInput | UserCreateOrConnectWithoutCollegeInput[]
    createMany?: UserCreateManyCollegeInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StudentUpdateManyWithoutCollegeNestedInput = {
    create?: XOR<StudentCreateWithoutCollegeInput, StudentUncheckedCreateWithoutCollegeInput> | StudentCreateWithoutCollegeInput[] | StudentUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutCollegeInput | StudentCreateOrConnectWithoutCollegeInput[]
    upsert?: StudentUpsertWithWhereUniqueWithoutCollegeInput | StudentUpsertWithWhereUniqueWithoutCollegeInput[]
    createMany?: StudentCreateManyCollegeInputEnvelope
    set?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    disconnect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    delete?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    update?: StudentUpdateWithWhereUniqueWithoutCollegeInput | StudentUpdateWithWhereUniqueWithoutCollegeInput[]
    updateMany?: StudentUpdateManyWithWhereWithoutCollegeInput | StudentUpdateManyWithWhereWithoutCollegeInput[]
    deleteMany?: StudentScalarWhereInput | StudentScalarWhereInput[]
  }

  export type UserUpdateManyWithoutCollegeNestedInput = {
    create?: XOR<UserCreateWithoutCollegeInput, UserUncheckedCreateWithoutCollegeInput> | UserCreateWithoutCollegeInput[] | UserUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCollegeInput | UserCreateOrConnectWithoutCollegeInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCollegeInput | UserUpsertWithWhereUniqueWithoutCollegeInput[]
    createMany?: UserCreateManyCollegeInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCollegeInput | UserUpdateWithWhereUniqueWithoutCollegeInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCollegeInput | UserUpdateManyWithWhereWithoutCollegeInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type StudentUncheckedUpdateManyWithoutCollegeNestedInput = {
    create?: XOR<StudentCreateWithoutCollegeInput, StudentUncheckedCreateWithoutCollegeInput> | StudentCreateWithoutCollegeInput[] | StudentUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutCollegeInput | StudentCreateOrConnectWithoutCollegeInput[]
    upsert?: StudentUpsertWithWhereUniqueWithoutCollegeInput | StudentUpsertWithWhereUniqueWithoutCollegeInput[]
    createMany?: StudentCreateManyCollegeInputEnvelope
    set?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    disconnect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    delete?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    update?: StudentUpdateWithWhereUniqueWithoutCollegeInput | StudentUpdateWithWhereUniqueWithoutCollegeInput[]
    updateMany?: StudentUpdateManyWithWhereWithoutCollegeInput | StudentUpdateManyWithWhereWithoutCollegeInput[]
    deleteMany?: StudentScalarWhereInput | StudentScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutCollegeNestedInput = {
    create?: XOR<UserCreateWithoutCollegeInput, UserUncheckedCreateWithoutCollegeInput> | UserCreateWithoutCollegeInput[] | UserUncheckedCreateWithoutCollegeInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCollegeInput | UserCreateOrConnectWithoutCollegeInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCollegeInput | UserUpsertWithWhereUniqueWithoutCollegeInput[]
    createMany?: UserCreateManyCollegeInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCollegeInput | UserUpdateWithWhereUniqueWithoutCollegeInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCollegeInput | UserUpdateManyWithWhereWithoutCollegeInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutStudentInput = {
    create?: XOR<UserCreateWithoutStudentInput, UserUncheckedCreateWithoutStudentInput>
    connectOrCreate?: UserCreateOrConnectWithoutStudentInput
    connect?: UserWhereUniqueInput
  }

  export type CollegeCreateNestedOneWithoutStudentsInput = {
    create?: XOR<CollegeCreateWithoutStudentsInput, CollegeUncheckedCreateWithoutStudentsInput>
    connectOrCreate?: CollegeCreateOrConnectWithoutStudentsInput
    connect?: CollegeWhereUniqueInput
  }

  export type GitHubProfileCreateNestedOneWithoutStudentInput = {
    create?: XOR<GitHubProfileCreateWithoutStudentInput, GitHubProfileUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GitHubProfileCreateOrConnectWithoutStudentInput
    connect?: GitHubProfileWhereUniqueInput
  }

  export type DSAProfileCreateNestedManyWithoutStudentInput = {
    create?: XOR<DSAProfileCreateWithoutStudentInput, DSAProfileUncheckedCreateWithoutStudentInput> | DSAProfileCreateWithoutStudentInput[] | DSAProfileUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: DSAProfileCreateOrConnectWithoutStudentInput | DSAProfileCreateOrConnectWithoutStudentInput[]
    createMany?: DSAProfileCreateManyStudentInputEnvelope
    connect?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
  }

  export type JRICalculationCreateNestedManyWithoutStudentInput = {
    create?: XOR<JRICalculationCreateWithoutStudentInput, JRICalculationUncheckedCreateWithoutStudentInput> | JRICalculationCreateWithoutStudentInput[] | JRICalculationUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: JRICalculationCreateOrConnectWithoutStudentInput | JRICalculationCreateOrConnectWithoutStudentInput[]
    createMany?: JRICalculationCreateManyStudentInputEnvelope
    connect?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
  }

  export type GitHubProfileUncheckedCreateNestedOneWithoutStudentInput = {
    create?: XOR<GitHubProfileCreateWithoutStudentInput, GitHubProfileUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GitHubProfileCreateOrConnectWithoutStudentInput
    connect?: GitHubProfileWhereUniqueInput
  }

  export type DSAProfileUncheckedCreateNestedManyWithoutStudentInput = {
    create?: XOR<DSAProfileCreateWithoutStudentInput, DSAProfileUncheckedCreateWithoutStudentInput> | DSAProfileCreateWithoutStudentInput[] | DSAProfileUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: DSAProfileCreateOrConnectWithoutStudentInput | DSAProfileCreateOrConnectWithoutStudentInput[]
    createMany?: DSAProfileCreateManyStudentInputEnvelope
    connect?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
  }

  export type JRICalculationUncheckedCreateNestedManyWithoutStudentInput = {
    create?: XOR<JRICalculationCreateWithoutStudentInput, JRICalculationUncheckedCreateWithoutStudentInput> | JRICalculationCreateWithoutStudentInput[] | JRICalculationUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: JRICalculationCreateOrConnectWithoutStudentInput | JRICalculationCreateOrConnectWithoutStudentInput[]
    createMany?: JRICalculationCreateManyStudentInputEnvelope
    connect?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutStudentNestedInput = {
    create?: XOR<UserCreateWithoutStudentInput, UserUncheckedCreateWithoutStudentInput>
    connectOrCreate?: UserCreateOrConnectWithoutStudentInput
    upsert?: UserUpsertWithoutStudentInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutStudentInput, UserUpdateWithoutStudentInput>, UserUncheckedUpdateWithoutStudentInput>
  }

  export type CollegeUpdateOneWithoutStudentsNestedInput = {
    create?: XOR<CollegeCreateWithoutStudentsInput, CollegeUncheckedCreateWithoutStudentsInput>
    connectOrCreate?: CollegeCreateOrConnectWithoutStudentsInput
    upsert?: CollegeUpsertWithoutStudentsInput
    disconnect?: CollegeWhereInput | boolean
    delete?: CollegeWhereInput | boolean
    connect?: CollegeWhereUniqueInput
    update?: XOR<XOR<CollegeUpdateToOneWithWhereWithoutStudentsInput, CollegeUpdateWithoutStudentsInput>, CollegeUncheckedUpdateWithoutStudentsInput>
  }

  export type GitHubProfileUpdateOneWithoutStudentNestedInput = {
    create?: XOR<GitHubProfileCreateWithoutStudentInput, GitHubProfileUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GitHubProfileCreateOrConnectWithoutStudentInput
    upsert?: GitHubProfileUpsertWithoutStudentInput
    disconnect?: GitHubProfileWhereInput | boolean
    delete?: GitHubProfileWhereInput | boolean
    connect?: GitHubProfileWhereUniqueInput
    update?: XOR<XOR<GitHubProfileUpdateToOneWithWhereWithoutStudentInput, GitHubProfileUpdateWithoutStudentInput>, GitHubProfileUncheckedUpdateWithoutStudentInput>
  }

  export type DSAProfileUpdateManyWithoutStudentNestedInput = {
    create?: XOR<DSAProfileCreateWithoutStudentInput, DSAProfileUncheckedCreateWithoutStudentInput> | DSAProfileCreateWithoutStudentInput[] | DSAProfileUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: DSAProfileCreateOrConnectWithoutStudentInput | DSAProfileCreateOrConnectWithoutStudentInput[]
    upsert?: DSAProfileUpsertWithWhereUniqueWithoutStudentInput | DSAProfileUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: DSAProfileCreateManyStudentInputEnvelope
    set?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    disconnect?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    delete?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    connect?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    update?: DSAProfileUpdateWithWhereUniqueWithoutStudentInput | DSAProfileUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: DSAProfileUpdateManyWithWhereWithoutStudentInput | DSAProfileUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: DSAProfileScalarWhereInput | DSAProfileScalarWhereInput[]
  }

  export type JRICalculationUpdateManyWithoutStudentNestedInput = {
    create?: XOR<JRICalculationCreateWithoutStudentInput, JRICalculationUncheckedCreateWithoutStudentInput> | JRICalculationCreateWithoutStudentInput[] | JRICalculationUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: JRICalculationCreateOrConnectWithoutStudentInput | JRICalculationCreateOrConnectWithoutStudentInput[]
    upsert?: JRICalculationUpsertWithWhereUniqueWithoutStudentInput | JRICalculationUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: JRICalculationCreateManyStudentInputEnvelope
    set?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    disconnect?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    delete?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    connect?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    update?: JRICalculationUpdateWithWhereUniqueWithoutStudentInput | JRICalculationUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: JRICalculationUpdateManyWithWhereWithoutStudentInput | JRICalculationUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: JRICalculationScalarWhereInput | JRICalculationScalarWhereInput[]
  }

  export type GitHubProfileUncheckedUpdateOneWithoutStudentNestedInput = {
    create?: XOR<GitHubProfileCreateWithoutStudentInput, GitHubProfileUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GitHubProfileCreateOrConnectWithoutStudentInput
    upsert?: GitHubProfileUpsertWithoutStudentInput
    disconnect?: GitHubProfileWhereInput | boolean
    delete?: GitHubProfileWhereInput | boolean
    connect?: GitHubProfileWhereUniqueInput
    update?: XOR<XOR<GitHubProfileUpdateToOneWithWhereWithoutStudentInput, GitHubProfileUpdateWithoutStudentInput>, GitHubProfileUncheckedUpdateWithoutStudentInput>
  }

  export type DSAProfileUncheckedUpdateManyWithoutStudentNestedInput = {
    create?: XOR<DSAProfileCreateWithoutStudentInput, DSAProfileUncheckedCreateWithoutStudentInput> | DSAProfileCreateWithoutStudentInput[] | DSAProfileUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: DSAProfileCreateOrConnectWithoutStudentInput | DSAProfileCreateOrConnectWithoutStudentInput[]
    upsert?: DSAProfileUpsertWithWhereUniqueWithoutStudentInput | DSAProfileUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: DSAProfileCreateManyStudentInputEnvelope
    set?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    disconnect?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    delete?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    connect?: DSAProfileWhereUniqueInput | DSAProfileWhereUniqueInput[]
    update?: DSAProfileUpdateWithWhereUniqueWithoutStudentInput | DSAProfileUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: DSAProfileUpdateManyWithWhereWithoutStudentInput | DSAProfileUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: DSAProfileScalarWhereInput | DSAProfileScalarWhereInput[]
  }

  export type JRICalculationUncheckedUpdateManyWithoutStudentNestedInput = {
    create?: XOR<JRICalculationCreateWithoutStudentInput, JRICalculationUncheckedCreateWithoutStudentInput> | JRICalculationCreateWithoutStudentInput[] | JRICalculationUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: JRICalculationCreateOrConnectWithoutStudentInput | JRICalculationCreateOrConnectWithoutStudentInput[]
    upsert?: JRICalculationUpsertWithWhereUniqueWithoutStudentInput | JRICalculationUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: JRICalculationCreateManyStudentInputEnvelope
    set?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    disconnect?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    delete?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    connect?: JRICalculationWhereUniqueInput | JRICalculationWhereUniqueInput[]
    update?: JRICalculationUpdateWithWhereUniqueWithoutStudentInput | JRICalculationUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: JRICalculationUpdateManyWithWhereWithoutStudentInput | JRICalculationUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: JRICalculationScalarWhereInput | JRICalculationScalarWhereInput[]
  }

  export type StudentCreateNestedOneWithoutGithubProfileInput = {
    create?: XOR<StudentCreateWithoutGithubProfileInput, StudentUncheckedCreateWithoutGithubProfileInput>
    connectOrCreate?: StudentCreateOrConnectWithoutGithubProfileInput
    connect?: StudentWhereUniqueInput
  }

  export type EnumFetchStatusFieldUpdateOperationsInput = {
    set?: $Enums.FetchStatus
  }

  export type StudentUpdateOneRequiredWithoutGithubProfileNestedInput = {
    create?: XOR<StudentCreateWithoutGithubProfileInput, StudentUncheckedCreateWithoutGithubProfileInput>
    connectOrCreate?: StudentCreateOrConnectWithoutGithubProfileInput
    upsert?: StudentUpsertWithoutGithubProfileInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutGithubProfileInput, StudentUpdateWithoutGithubProfileInput>, StudentUncheckedUpdateWithoutGithubProfileInput>
  }

  export type StudentCreateNestedOneWithoutDsaProfilesInput = {
    create?: XOR<StudentCreateWithoutDsaProfilesInput, StudentUncheckedCreateWithoutDsaProfilesInput>
    connectOrCreate?: StudentCreateOrConnectWithoutDsaProfilesInput
    connect?: StudentWhereUniqueInput
  }

  export type EnumPlatformFieldUpdateOperationsInput = {
    set?: $Enums.Platform
  }

  export type StudentUpdateOneRequiredWithoutDsaProfilesNestedInput = {
    create?: XOR<StudentCreateWithoutDsaProfilesInput, StudentUncheckedCreateWithoutDsaProfilesInput>
    connectOrCreate?: StudentCreateOrConnectWithoutDsaProfilesInput
    upsert?: StudentUpsertWithoutDsaProfilesInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutDsaProfilesInput, StudentUpdateWithoutDsaProfilesInput>, StudentUncheckedUpdateWithoutDsaProfilesInput>
  }

  export type StudentCreateNestedOneWithoutJriCalculationsInput = {
    create?: XOR<StudentCreateWithoutJriCalculationsInput, StudentUncheckedCreateWithoutJriCalculationsInput>
    connectOrCreate?: StudentCreateOrConnectWithoutJriCalculationsInput
    connect?: StudentWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type StudentUpdateOneRequiredWithoutJriCalculationsNestedInput = {
    create?: XOR<StudentCreateWithoutJriCalculationsInput, StudentUncheckedCreateWithoutJriCalculationsInput>
    connectOrCreate?: StudentCreateOrConnectWithoutJriCalculationsInput
    upsert?: StudentUpsertWithoutJriCalculationsInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutJriCalculationsInput, StudentUpdateWithoutJriCalculationsInput>, StudentUncheckedUpdateWithoutJriCalculationsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumFetchStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FetchStatus | EnumFetchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFetchStatusFilter<$PrismaModel> | $Enums.FetchStatus
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumFetchStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FetchStatus | EnumFetchStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FetchStatus[] | ListEnumFetchStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFetchStatusWithAggregatesFilter<$PrismaModel> | $Enums.FetchStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFetchStatusFilter<$PrismaModel>
    _max?: NestedEnumFetchStatusFilter<$PrismaModel>
  }

  export type NestedEnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }

  export type NestedEnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type CollegeCreateWithoutUsersInput = {
    id?: string
    name: string
    shortName: string
    domain?: string | null
    location?: string | null
    website?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    students?: StudentCreateNestedManyWithoutCollegeInput
  }

  export type CollegeUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    shortName: string
    domain?: string | null
    location?: string | null
    website?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    students?: StudentUncheckedCreateNestedManyWithoutCollegeInput
  }

  export type CollegeCreateOrConnectWithoutUsersInput = {
    where: CollegeWhereUniqueInput
    create: XOR<CollegeCreateWithoutUsersInput, CollegeUncheckedCreateWithoutUsersInput>
  }

  export type StudentCreateWithoutUserInput = {
    id?: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    college?: CollegeCreateNestedOneWithoutStudentsInput
    githubProfile?: GitHubProfileCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationCreateNestedManyWithoutStudentInput
  }

  export type StudentUncheckedCreateWithoutUserInput = {
    id?: string
    collegeId?: string | null
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    githubProfile?: GitHubProfileUncheckedCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileUncheckedCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutUserInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutUserInput, StudentUncheckedCreateWithoutUserInput>
  }

  export type CollegeUpsertWithoutUsersInput = {
    update: XOR<CollegeUpdateWithoutUsersInput, CollegeUncheckedUpdateWithoutUsersInput>
    create: XOR<CollegeCreateWithoutUsersInput, CollegeUncheckedCreateWithoutUsersInput>
    where?: CollegeWhereInput
  }

  export type CollegeUpdateToOneWithWhereWithoutUsersInput = {
    where?: CollegeWhereInput
    data: XOR<CollegeUpdateWithoutUsersInput, CollegeUncheckedUpdateWithoutUsersInput>
  }

  export type CollegeUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    students?: StudentUpdateManyWithoutCollegeNestedInput
  }

  export type CollegeUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    students?: StudentUncheckedUpdateManyWithoutCollegeNestedInput
  }

  export type StudentUpsertWithoutUserInput = {
    update: XOR<StudentUpdateWithoutUserInput, StudentUncheckedUpdateWithoutUserInput>
    create: XOR<StudentCreateWithoutUserInput, StudentUncheckedCreateWithoutUserInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutUserInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutUserInput, StudentUncheckedUpdateWithoutUserInput>
  }

  export type StudentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    college?: CollegeUpdateOneWithoutStudentsNestedInput
    githubProfile?: GitHubProfileUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    githubProfile?: GitHubProfileUncheckedUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUncheckedUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateWithoutCollegeInput = {
    id?: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutStudentInput
    githubProfile?: GitHubProfileCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationCreateNestedManyWithoutStudentInput
  }

  export type StudentUncheckedCreateWithoutCollegeInput = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    githubProfile?: GitHubProfileUncheckedCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileUncheckedCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutCollegeInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutCollegeInput, StudentUncheckedCreateWithoutCollegeInput>
  }

  export type StudentCreateManyCollegeInputEnvelope = {
    data: StudentCreateManyCollegeInput | StudentCreateManyCollegeInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutCollegeInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    student?: StudentCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCollegeInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    student?: StudentUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCollegeInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCollegeInput, UserUncheckedCreateWithoutCollegeInput>
  }

  export type UserCreateManyCollegeInputEnvelope = {
    data: UserCreateManyCollegeInput | UserCreateManyCollegeInput[]
    skipDuplicates?: boolean
  }

  export type StudentUpsertWithWhereUniqueWithoutCollegeInput = {
    where: StudentWhereUniqueInput
    update: XOR<StudentUpdateWithoutCollegeInput, StudentUncheckedUpdateWithoutCollegeInput>
    create: XOR<StudentCreateWithoutCollegeInput, StudentUncheckedCreateWithoutCollegeInput>
  }

  export type StudentUpdateWithWhereUniqueWithoutCollegeInput = {
    where: StudentWhereUniqueInput
    data: XOR<StudentUpdateWithoutCollegeInput, StudentUncheckedUpdateWithoutCollegeInput>
  }

  export type StudentUpdateManyWithWhereWithoutCollegeInput = {
    where: StudentScalarWhereInput
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyWithoutCollegeInput>
  }

  export type StudentScalarWhereInput = {
    AND?: StudentScalarWhereInput | StudentScalarWhereInput[]
    OR?: StudentScalarWhereInput[]
    NOT?: StudentScalarWhereInput | StudentScalarWhereInput[]
    id?: StringFilter<"Student"> | string
    userId?: StringFilter<"Student"> | string
    collegeId?: StringNullableFilter<"Student"> | string | null
    firstName?: StringFilter<"Student"> | string
    lastName?: StringFilter<"Student"> | string
    rollNumber?: StringFilter<"Student"> | string
    email?: StringFilter<"Student"> | string
    phone?: StringNullableFilter<"Student"> | string | null
    department?: StringFilter<"Student"> | string
    semester?: IntFilter<"Student"> | number
    batch?: StringFilter<"Student"> | string
    section?: StringNullableFilter<"Student"> | string | null
    isPlaced?: BoolFilter<"Student"> | boolean
    placementYear?: IntNullableFilter<"Student"> | number | null
    packageOffered?: FloatNullableFilter<"Student"> | number | null
    companyName?: StringNullableFilter<"Student"> | string | null
    githubUsername?: StringNullableFilter<"Student"> | string | null
    githubAccessToken?: StringNullableFilter<"Student"> | string | null
    githubConnectedAt?: DateTimeNullableFilter<"Student"> | Date | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
    updatedAt?: DateTimeFilter<"Student"> | Date | string
  }

  export type UserUpsertWithWhereUniqueWithoutCollegeInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutCollegeInput, UserUncheckedUpdateWithoutCollegeInput>
    create: XOR<UserCreateWithoutCollegeInput, UserUncheckedCreateWithoutCollegeInput>
  }

  export type UserUpdateWithWhereUniqueWithoutCollegeInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutCollegeInput, UserUncheckedUpdateWithoutCollegeInput>
  }

  export type UserUpdateManyWithWhereWithoutCollegeInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutCollegeInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    collegeId?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
  }

  export type UserCreateWithoutStudentInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    college?: CollegeCreateNestedOneWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutStudentInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    collegeId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
  }

  export type UserCreateOrConnectWithoutStudentInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutStudentInput, UserUncheckedCreateWithoutStudentInput>
  }

  export type CollegeCreateWithoutStudentsInput = {
    id?: string
    name: string
    shortName: string
    domain?: string | null
    location?: string | null
    website?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutCollegeInput
  }

  export type CollegeUncheckedCreateWithoutStudentsInput = {
    id?: string
    name: string
    shortName: string
    domain?: string | null
    location?: string | null
    website?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutCollegeInput
  }

  export type CollegeCreateOrConnectWithoutStudentsInput = {
    where: CollegeWhereUniqueInput
    create: XOR<CollegeCreateWithoutStudentsInput, CollegeUncheckedCreateWithoutStudentsInput>
  }

  export type GitHubProfileCreateWithoutStudentInput = {
    id?: string
    username: string
    profileUrl: string
    totalRepos?: number
    totalCommits?: number
    totalStars?: number
    totalForks?: number
    languagesUsed: JsonNullValueInput | InputJsonValue
    frameworks: JsonNullValueInput | InputJsonValue
    repositories: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GitHubProfileUncheckedCreateWithoutStudentInput = {
    id?: string
    username: string
    profileUrl: string
    totalRepos?: number
    totalCommits?: number
    totalStars?: number
    totalForks?: number
    languagesUsed: JsonNullValueInput | InputJsonValue
    frameworks: JsonNullValueInput | InputJsonValue
    repositories: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GitHubProfileCreateOrConnectWithoutStudentInput = {
    where: GitHubProfileWhereUniqueInput
    create: XOR<GitHubProfileCreateWithoutStudentInput, GitHubProfileUncheckedCreateWithoutStudentInput>
  }

  export type DSAProfileCreateWithoutStudentInput = {
    id?: string
    platform: $Enums.Platform
    username: string
    profileUrl: string
    totalSolved?: number
    easySolved?: number
    mediumSolved?: number
    hardSolved?: number
    rating?: number | null
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DSAProfileUncheckedCreateWithoutStudentInput = {
    id?: string
    platform: $Enums.Platform
    username: string
    profileUrl: string
    totalSolved?: number
    easySolved?: number
    mediumSolved?: number
    hardSolved?: number
    rating?: number | null
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DSAProfileCreateOrConnectWithoutStudentInput = {
    where: DSAProfileWhereUniqueInput
    create: XOR<DSAProfileCreateWithoutStudentInput, DSAProfileUncheckedCreateWithoutStudentInput>
  }

  export type DSAProfileCreateManyStudentInputEnvelope = {
    data: DSAProfileCreateManyStudentInput | DSAProfileCreateManyStudentInput[]
    skipDuplicates?: boolean
  }

  export type JRICalculationCreateWithoutStudentInput = {
    id?: string
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: JsonNullValueInput | InputJsonValue
    rawScores: JsonNullValueInput | InputJsonValue
    algorithmVersion: string
    createdAt?: Date | string
  }

  export type JRICalculationUncheckedCreateWithoutStudentInput = {
    id?: string
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: JsonNullValueInput | InputJsonValue
    rawScores: JsonNullValueInput | InputJsonValue
    algorithmVersion: string
    createdAt?: Date | string
  }

  export type JRICalculationCreateOrConnectWithoutStudentInput = {
    where: JRICalculationWhereUniqueInput
    create: XOR<JRICalculationCreateWithoutStudentInput, JRICalculationUncheckedCreateWithoutStudentInput>
  }

  export type JRICalculationCreateManyStudentInputEnvelope = {
    data: JRICalculationCreateManyStudentInput | JRICalculationCreateManyStudentInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutStudentInput = {
    update: XOR<UserUpdateWithoutStudentInput, UserUncheckedUpdateWithoutStudentInput>
    create: XOR<UserCreateWithoutStudentInput, UserUncheckedCreateWithoutStudentInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutStudentInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutStudentInput, UserUncheckedUpdateWithoutStudentInput>
  }

  export type UserUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    college?: CollegeUpdateOneWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CollegeUpsertWithoutStudentsInput = {
    update: XOR<CollegeUpdateWithoutStudentsInput, CollegeUncheckedUpdateWithoutStudentsInput>
    create: XOR<CollegeCreateWithoutStudentsInput, CollegeUncheckedCreateWithoutStudentsInput>
    where?: CollegeWhereInput
  }

  export type CollegeUpdateToOneWithWhereWithoutStudentsInput = {
    where?: CollegeWhereInput
    data: XOR<CollegeUpdateWithoutStudentsInput, CollegeUncheckedUpdateWithoutStudentsInput>
  }

  export type CollegeUpdateWithoutStudentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutCollegeNestedInput
  }

  export type CollegeUncheckedUpdateWithoutStudentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    shortName?: StringFieldUpdateOperationsInput | string
    domain?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutCollegeNestedInput
  }

  export type GitHubProfileUpsertWithoutStudentInput = {
    update: XOR<GitHubProfileUpdateWithoutStudentInput, GitHubProfileUncheckedUpdateWithoutStudentInput>
    create: XOR<GitHubProfileCreateWithoutStudentInput, GitHubProfileUncheckedCreateWithoutStudentInput>
    where?: GitHubProfileWhereInput
  }

  export type GitHubProfileUpdateToOneWithWhereWithoutStudentInput = {
    where?: GitHubProfileWhereInput
    data: XOR<GitHubProfileUpdateWithoutStudentInput, GitHubProfileUncheckedUpdateWithoutStudentInput>
  }

  export type GitHubProfileUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalRepos?: IntFieldUpdateOperationsInput | number
    totalCommits?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    totalForks?: IntFieldUpdateOperationsInput | number
    languagesUsed?: JsonNullValueInput | InputJsonValue
    frameworks?: JsonNullValueInput | InputJsonValue
    repositories?: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GitHubProfileUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalRepos?: IntFieldUpdateOperationsInput | number
    totalCommits?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    totalForks?: IntFieldUpdateOperationsInput | number
    languagesUsed?: JsonNullValueInput | InputJsonValue
    frameworks?: JsonNullValueInput | InputJsonValue
    repositories?: JsonNullValueInput | InputJsonValue
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DSAProfileUpsertWithWhereUniqueWithoutStudentInput = {
    where: DSAProfileWhereUniqueInput
    update: XOR<DSAProfileUpdateWithoutStudentInput, DSAProfileUncheckedUpdateWithoutStudentInput>
    create: XOR<DSAProfileCreateWithoutStudentInput, DSAProfileUncheckedCreateWithoutStudentInput>
  }

  export type DSAProfileUpdateWithWhereUniqueWithoutStudentInput = {
    where: DSAProfileWhereUniqueInput
    data: XOR<DSAProfileUpdateWithoutStudentInput, DSAProfileUncheckedUpdateWithoutStudentInput>
  }

  export type DSAProfileUpdateManyWithWhereWithoutStudentInput = {
    where: DSAProfileScalarWhereInput
    data: XOR<DSAProfileUpdateManyMutationInput, DSAProfileUncheckedUpdateManyWithoutStudentInput>
  }

  export type DSAProfileScalarWhereInput = {
    AND?: DSAProfileScalarWhereInput | DSAProfileScalarWhereInput[]
    OR?: DSAProfileScalarWhereInput[]
    NOT?: DSAProfileScalarWhereInput | DSAProfileScalarWhereInput[]
    id?: StringFilter<"DSAProfile"> | string
    studentId?: StringFilter<"DSAProfile"> | string
    platform?: EnumPlatformFilter<"DSAProfile"> | $Enums.Platform
    username?: StringFilter<"DSAProfile"> | string
    profileUrl?: StringFilter<"DSAProfile"> | string
    totalSolved?: IntFilter<"DSAProfile"> | number
    easySolved?: IntFilter<"DSAProfile"> | number
    mediumSolved?: IntFilter<"DSAProfile"> | number
    hardSolved?: IntFilter<"DSAProfile"> | number
    rating?: FloatNullableFilter<"DSAProfile"> | number | null
    lastFetchedAt?: DateTimeNullableFilter<"DSAProfile"> | Date | string | null
    fetchStatus?: EnumFetchStatusFilter<"DSAProfile"> | $Enums.FetchStatus
    errorMessage?: StringNullableFilter<"DSAProfile"> | string | null
    createdAt?: DateTimeFilter<"DSAProfile"> | Date | string
    updatedAt?: DateTimeFilter<"DSAProfile"> | Date | string
  }

  export type JRICalculationUpsertWithWhereUniqueWithoutStudentInput = {
    where: JRICalculationWhereUniqueInput
    update: XOR<JRICalculationUpdateWithoutStudentInput, JRICalculationUncheckedUpdateWithoutStudentInput>
    create: XOR<JRICalculationCreateWithoutStudentInput, JRICalculationUncheckedCreateWithoutStudentInput>
  }

  export type JRICalculationUpdateWithWhereUniqueWithoutStudentInput = {
    where: JRICalculationWhereUniqueInput
    data: XOR<JRICalculationUpdateWithoutStudentInput, JRICalculationUncheckedUpdateWithoutStudentInput>
  }

  export type JRICalculationUpdateManyWithWhereWithoutStudentInput = {
    where: JRICalculationScalarWhereInput
    data: XOR<JRICalculationUpdateManyMutationInput, JRICalculationUncheckedUpdateManyWithoutStudentInput>
  }

  export type JRICalculationScalarWhereInput = {
    AND?: JRICalculationScalarWhereInput | JRICalculationScalarWhereInput[]
    OR?: JRICalculationScalarWhereInput[]
    NOT?: JRICalculationScalarWhereInput | JRICalculationScalarWhereInput[]
    id?: StringFilter<"JRICalculation"> | string
    studentId?: StringFilter<"JRICalculation"> | string
    jriScore?: FloatFilter<"JRICalculation"> | number
    githubScore?: FloatFilter<"JRICalculation"> | number
    dsaScore?: FloatFilter<"JRICalculation"> | number
    academicScore?: FloatFilter<"JRICalculation"> | number
    hackathonScore?: FloatFilter<"JRICalculation"> | number
    weights?: JsonFilter<"JRICalculation">
    rawScores?: JsonFilter<"JRICalculation">
    algorithmVersion?: StringFilter<"JRICalculation"> | string
    createdAt?: DateTimeFilter<"JRICalculation"> | Date | string
  }

  export type StudentCreateWithoutGithubProfileInput = {
    id?: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutStudentInput
    college?: CollegeCreateNestedOneWithoutStudentsInput
    dsaProfiles?: DSAProfileCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationCreateNestedManyWithoutStudentInput
  }

  export type StudentUncheckedCreateWithoutGithubProfileInput = {
    id?: string
    userId: string
    collegeId?: string | null
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    dsaProfiles?: DSAProfileUncheckedCreateNestedManyWithoutStudentInput
    jriCalculations?: JRICalculationUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutGithubProfileInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutGithubProfileInput, StudentUncheckedCreateWithoutGithubProfileInput>
  }

  export type StudentUpsertWithoutGithubProfileInput = {
    update: XOR<StudentUpdateWithoutGithubProfileInput, StudentUncheckedUpdateWithoutGithubProfileInput>
    create: XOR<StudentCreateWithoutGithubProfileInput, StudentUncheckedCreateWithoutGithubProfileInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutGithubProfileInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutGithubProfileInput, StudentUncheckedUpdateWithoutGithubProfileInput>
  }

  export type StudentUpdateWithoutGithubProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutStudentNestedInput
    college?: CollegeUpdateOneWithoutStudentsNestedInput
    dsaProfiles?: DSAProfileUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateWithoutGithubProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dsaProfiles?: DSAProfileUncheckedUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateWithoutDsaProfilesInput = {
    id?: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutStudentInput
    college?: CollegeCreateNestedOneWithoutStudentsInput
    githubProfile?: GitHubProfileCreateNestedOneWithoutStudentInput
    jriCalculations?: JRICalculationCreateNestedManyWithoutStudentInput
  }

  export type StudentUncheckedCreateWithoutDsaProfilesInput = {
    id?: string
    userId: string
    collegeId?: string | null
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    githubProfile?: GitHubProfileUncheckedCreateNestedOneWithoutStudentInput
    jriCalculations?: JRICalculationUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutDsaProfilesInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutDsaProfilesInput, StudentUncheckedCreateWithoutDsaProfilesInput>
  }

  export type StudentUpsertWithoutDsaProfilesInput = {
    update: XOR<StudentUpdateWithoutDsaProfilesInput, StudentUncheckedUpdateWithoutDsaProfilesInput>
    create: XOR<StudentCreateWithoutDsaProfilesInput, StudentUncheckedCreateWithoutDsaProfilesInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutDsaProfilesInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutDsaProfilesInput, StudentUncheckedUpdateWithoutDsaProfilesInput>
  }

  export type StudentUpdateWithoutDsaProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutStudentNestedInput
    college?: CollegeUpdateOneWithoutStudentsNestedInput
    githubProfile?: GitHubProfileUpdateOneWithoutStudentNestedInput
    jriCalculations?: JRICalculationUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateWithoutDsaProfilesInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    githubProfile?: GitHubProfileUncheckedUpdateOneWithoutStudentNestedInput
    jriCalculations?: JRICalculationUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateWithoutJriCalculationsInput = {
    id?: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutStudentInput
    college?: CollegeCreateNestedOneWithoutStudentsInput
    githubProfile?: GitHubProfileCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileCreateNestedManyWithoutStudentInput
  }

  export type StudentUncheckedCreateWithoutJriCalculationsInput = {
    id?: string
    userId: string
    collegeId?: string | null
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    githubProfile?: GitHubProfileUncheckedCreateNestedOneWithoutStudentInput
    dsaProfiles?: DSAProfileUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutJriCalculationsInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutJriCalculationsInput, StudentUncheckedCreateWithoutJriCalculationsInput>
  }

  export type StudentUpsertWithoutJriCalculationsInput = {
    update: XOR<StudentUpdateWithoutJriCalculationsInput, StudentUncheckedUpdateWithoutJriCalculationsInput>
    create: XOR<StudentCreateWithoutJriCalculationsInput, StudentUncheckedCreateWithoutJriCalculationsInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutJriCalculationsInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutJriCalculationsInput, StudentUncheckedUpdateWithoutJriCalculationsInput>
  }

  export type StudentUpdateWithoutJriCalculationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutStudentNestedInput
    college?: CollegeUpdateOneWithoutStudentsNestedInput
    githubProfile?: GitHubProfileUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateWithoutJriCalculationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    collegeId?: NullableStringFieldUpdateOperationsInput | string | null
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    githubProfile?: GitHubProfileUncheckedUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateManyCollegeInput = {
    id?: string
    userId: string
    firstName: string
    lastName: string
    rollNumber: string
    email: string
    phone?: string | null
    department: string
    semester: number
    batch: string
    section?: string | null
    isPlaced?: boolean
    placementYear?: number | null
    packageOffered?: number | null
    companyName?: string | null
    githubUsername?: string | null
    githubAccessToken?: string | null
    githubConnectedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateManyCollegeInput = {
    id?: string
    email: string
    passwordHash: string
    role?: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
  }

  export type StudentUpdateWithoutCollegeInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutStudentNestedInput
    githubProfile?: GitHubProfileUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateWithoutCollegeInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    githubProfile?: GitHubProfileUncheckedUpdateOneWithoutStudentNestedInput
    dsaProfiles?: DSAProfileUncheckedUpdateManyWithoutStudentNestedInput
    jriCalculations?: JRICalculationUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateManyWithoutCollegeInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    rollNumber?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    department?: StringFieldUpdateOperationsInput | string
    semester?: IntFieldUpdateOperationsInput | number
    batch?: StringFieldUpdateOperationsInput | string
    section?: NullableStringFieldUpdateOperationsInput | string | null
    isPlaced?: BoolFieldUpdateOperationsInput | boolean
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    packageOffered?: NullableFloatFieldUpdateOperationsInput | number | null
    companyName?: NullableStringFieldUpdateOperationsInput | string | null
    githubUsername?: NullableStringFieldUpdateOperationsInput | string | null
    githubAccessToken?: NullableStringFieldUpdateOperationsInput | string | null
    githubConnectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpdateWithoutCollegeInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    student?: StudentUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCollegeInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    student?: StudentUncheckedUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutCollegeInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DSAProfileCreateManyStudentInput = {
    id?: string
    platform: $Enums.Platform
    username: string
    profileUrl: string
    totalSolved?: number
    easySolved?: number
    mediumSolved?: number
    hardSolved?: number
    rating?: number | null
    lastFetchedAt?: Date | string | null
    fetchStatus?: $Enums.FetchStatus
    errorMessage?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JRICalculationCreateManyStudentInput = {
    id?: string
    jriScore: number
    githubScore: number
    dsaScore: number
    academicScore: number
    hackathonScore: number
    weights: JsonNullValueInput | InputJsonValue
    rawScores: JsonNullValueInput | InputJsonValue
    algorithmVersion: string
    createdAt?: Date | string
  }

  export type DSAProfileUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalSolved?: IntFieldUpdateOperationsInput | number
    easySolved?: IntFieldUpdateOperationsInput | number
    mediumSolved?: IntFieldUpdateOperationsInput | number
    hardSolved?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DSAProfileUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalSolved?: IntFieldUpdateOperationsInput | number
    easySolved?: IntFieldUpdateOperationsInput | number
    mediumSolved?: IntFieldUpdateOperationsInput | number
    hardSolved?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DSAProfileUncheckedUpdateManyWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    username?: StringFieldUpdateOperationsInput | string
    profileUrl?: StringFieldUpdateOperationsInput | string
    totalSolved?: IntFieldUpdateOperationsInput | number
    easySolved?: IntFieldUpdateOperationsInput | number
    mediumSolved?: IntFieldUpdateOperationsInput | number
    hardSolved?: IntFieldUpdateOperationsInput | number
    rating?: NullableFloatFieldUpdateOperationsInput | number | null
    lastFetchedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fetchStatus?: EnumFetchStatusFieldUpdateOperationsInput | $Enums.FetchStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JRICalculationUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    jriScore?: FloatFieldUpdateOperationsInput | number
    githubScore?: FloatFieldUpdateOperationsInput | number
    dsaScore?: FloatFieldUpdateOperationsInput | number
    academicScore?: FloatFieldUpdateOperationsInput | number
    hackathonScore?: FloatFieldUpdateOperationsInput | number
    weights?: JsonNullValueInput | InputJsonValue
    rawScores?: JsonNullValueInput | InputJsonValue
    algorithmVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JRICalculationUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    jriScore?: FloatFieldUpdateOperationsInput | number
    githubScore?: FloatFieldUpdateOperationsInput | number
    dsaScore?: FloatFieldUpdateOperationsInput | number
    academicScore?: FloatFieldUpdateOperationsInput | number
    hackathonScore?: FloatFieldUpdateOperationsInput | number
    weights?: JsonNullValueInput | InputJsonValue
    rawScores?: JsonNullValueInput | InputJsonValue
    algorithmVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JRICalculationUncheckedUpdateManyWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    jriScore?: FloatFieldUpdateOperationsInput | number
    githubScore?: FloatFieldUpdateOperationsInput | number
    dsaScore?: FloatFieldUpdateOperationsInput | number
    academicScore?: FloatFieldUpdateOperationsInput | number
    hackathonScore?: FloatFieldUpdateOperationsInput | number
    weights?: JsonNullValueInput | InputJsonValue
    rawScores?: JsonNullValueInput | InputJsonValue
    algorithmVersion?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}