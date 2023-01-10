/* from node_modules\knex\types\index.d.ts */

/*













SCHEMA BUILDING main interfaces & methods














TableBuilder
  // these return a TableBuilder
  primary(string[])
  unique(string[])
  setNullable(string)

  // these return a ColumnBuilder, so can be chained by a ColumnBuilder method
  increments(string)
  integer
  text
  boolean
  timestamp 

  // this'll add created_at and updated_at fields. We'll not chain anything after it because that'd be nonsense.
  timestamps(true, true, false)

  // this is for foreign keys. We'll always chain it with these other methods (only references(string) is required)
  foreign(string).references(string).inTable(string).deferrable(string).onUpdate(string).onDelete(string)

ColumnBuilder
  // ColumnBuilder's chaining methods
  primary()
  unique()
  unsigned()
  nullable()
  notNullable()
  defaultTo(value)
*/

interface TableBuilder {
  increments(
    columnName?: string,
    options?: { primaryKey?: boolean }
  ): ColumnBuilder // pg type SERIAL. Also turns column into primaryKey by default, unless it already has been declared a primary key with primary()
  integer(columnName: string, length?: number): ColumnBuilder
  text(columnName: string, textType?: string): ColumnBuilder // pg type TEXT, meaning unlimited length
  boolean(columnName: string): ColumnBuilder
  timestamp(
    columnName: string,
    options?: Readonly<{ useTz?: boolean; precision?: number }>
  ): ColumnBuilder // in pg useTz is true by default
  timestamps(
    useTimestamps?: boolean,
    defaultToNow?: boolean,
    useCamelCase?: boolean
  ): ColumnBuilder // use true, true, false

  primary(
    columnNames: readonly string[],
    options?: Readonly<{
      constraintName?: string
      deferrable?: deferrableType
    }>
  ): TableBuilder
  foreign(column: string, foreignKeyName?: string): ForeignConstraintBuilder
  setNullable(column: string): TableBuilder
  unique(
    columnNames: readonly (string | Raw)[],
    options?: Readonly<{
      indexName?: string
      storageEngineIndexType?: string
      deferrable?: deferrableType
      useConstraint?: boolean
    }>
  ): TableBuilder

  dropTimestamps(useCamelCase?: boolean): TableBuilder
  dropColumn(columnName: string): TableBuilder
  dropColumns(...columnNames: string[]): TableBuilder
  renameColumn(from: string, to: string): TableBuilder

  dropPrimary(constraintName?: string): TableBuilder
  dropForeign(
    columnNames: string | readonly string[],
    foreignKeyName?: string
  ): TableBuilder
  dropNullable(column: string): TableBuilder
  dropUnique(
    columnNames: readonly (string | Raw)[],
    indexName?: string
  ): TableBuilder
}

interface ColumnBuilder {
  primary(
    options?: Readonly<{
      constraintName?: string
      deferrable?: deferrableType
    }>
  ): ColumnBuilder

  unique(
    options?: Readonly<{ indexName?: string; deferrable?: deferrableType }>
  ): ColumnBuilder
  defaultTo(value: Value | null): ColumnBuilder
  unsigned(): ColumnBuilder
  notNullable(): ColumnBuilder
  nullable(): ColumnBuilder
  alter(
    options?: Readonly<{ alterNullable?: boolean; alterType?: boolean }>
  ): ColumnBuilder
}

interface ForeignConstraintBuilder {
  references(columnName: string): ReferencingColumnBuilder
}

// patched ColumnBuilder methods to return ReferencingColumnBuilder with new methods
// relies on ColumnBuilder returning only ColumnBuilder
type ReferencingColumnBuilder = {
  [K in keyof ColumnBuilder]: (
    ...args: Parameters<ColumnBuilder[K]>
  ) => ReferencingColumnBuilder
} & {
  inTable(tableName: string): ReferencingColumnBuilder
  deferrable(type: deferrableType): ReferencingColumnBuilder
  onDelete(command: string): ReferencingColumnBuilder // RESTRICT, CASCADE, SET NULL, NO ACTION
  onUpdate(command: string): ReferencingColumnBuilder
}

type deferrableType = 'not deferrable' | 'immediate' | 'deferred'

type Value =
  | string
  | number
  | boolean
  | Date
  | Array<string>
  | Array<number>
  | Array<Date>
  | Array<boolean>
  | Buffer
  | object
  | null
  | Knex.Raw

/*

















QUERY BUILDING main interfaces and methods

















*/

//
// QueryInterface
//

interface QueryInterface<TRecord extends {} = any, TResult = any> {
  select: Select<TRecord, TResult>
  columns: Select<TRecord, TResult>
  column: Select<TRecord, TResult>

  as: As<TRecord, TResult>

  from: Table<TRecord, TResult>
  fromRaw: Table<TRecord, TResult>
  into: Table<TRecord, TResult>
  table: Table<TRecord, TResult>

  distinct: Distinct<TRecord, TResult>
  distinctOn: DistinctOn<TRecord, TResult>

  // Joins
  join: Join<TRecord, TResult>
  joinRaw: JoinRaw<TRecord, TResult>
  innerJoin: Join<TRecord, TResult>
  leftJoin: Join<TRecord, TResult>
  leftOuterJoin: Join<TRecord, TResult>
  rightJoin: Join<TRecord, TResult>
  rightOuterJoin: Join<TRecord, TResult>
  outerJoin: Join<TRecord, TResult>
  fullOuterJoin: Join<TRecord, TResult>
  crossJoin: Join<TRecord, TResult>

  // Using
  using: Using<TRecord, TResult>

  // Withs
  with: With<TRecord, TResult>
  withRecursive: With<TRecord, TResult>
  withRaw: WithRaw<TRecord, TResult>

  // Wheres
  where: Where<TRecord, TResult>
  andWhere: Where<TRecord, TResult>
  orWhere: Where<TRecord, TResult>
  whereNot: Where<TRecord, TResult>
  andWhereNot: Where<TRecord, TResult>
  orWhereNot: Where<TRecord, TResult>
  whereRaw: WhereRaw<TRecord, TResult>
  orWhereRaw: WhereRaw<TRecord, TResult>
  andWhereRaw: WhereRaw<TRecord, TResult>
  whereExists: WhereExists<TRecord, TResult>
  orWhereExists: WhereExists<TRecord, TResult>
  whereNotExists: WhereExists<TRecord, TResult>
  orWhereNotExists: WhereExists<TRecord, TResult>
  whereIn: WhereIn<TRecord, TResult>
  orWhereIn: WhereIn<TRecord, TResult>
  whereNotIn: WhereIn<TRecord, TResult>
  orWhereNotIn: WhereIn<TRecord, TResult>
  whereLike: Where<TRecord, TResult>
  andWhereLike: Where<TRecord, TResult>
  orWhereLike: Where<TRecord, TResult>
  whereILike: Where<TRecord, TResult>
  andWhereILike: Where<TRecord, TResult>
  orWhereILike: Where<TRecord, TResult>
  whereNull: WhereNull<TRecord, TResult>
  orWhereNull: WhereNull<TRecord, TResult>
  whereNotNull: WhereNull<TRecord, TResult>
  orWhereNotNull: WhereNull<TRecord, TResult>
  whereBetween: WhereBetween<TRecord, TResult>
  orWhereBetween: WhereBetween<TRecord, TResult>
  andWhereBetween: WhereBetween<TRecord, TResult>
  whereNotBetween: WhereBetween<TRecord, TResult>
  orWhereNotBetween: WhereBetween<TRecord, TResult>
  andWhereNotBetween: WhereBetween<TRecord, TResult>

  // Group by
  groupBy: GroupBy<TRecord, TResult>
  groupByRaw: RawQueryBuilder<TRecord, TResult>

  // Order by
  orderBy: OrderBy<TRecord, TResult>
  orderByRaw: RawQueryBuilder<TRecord, TResult>

  // Intersect
  intersect: Intersect<TRecord, TResult>

  // Union
  union: Union<TRecord, TResult>
  unionAll: Union<TRecord, TResult>

  // Having
  having: Having<TRecord, TResult>
  andHaving: Having<TRecord, TResult>
  havingRaw: RawQueryBuilder<TRecord, TResult>
  orHaving: Having<TRecord, TResult>
  orHavingRaw: RawQueryBuilder<TRecord, TResult>
  havingIn: HavingRange<TRecord, TResult>
  orHavingNotBetween: HavingRange<TRecord, TResult>
  havingNotBetween: HavingRange<TRecord, TResult>
  orHavingBetween: HavingRange<TRecord, TResult>
  havingBetween: HavingRange<TRecord, TResult>
  havingNotIn: HavingRange<TRecord, TResult>
  andHavingNotIn: HavingRange<TRecord, TResult>
  orHavingNotIn: HavingRange<TRecord, TResult>

  // Paging
  offset(
    offset: number,
    options?: boolean | Readonly<{ skipBinding?: boolean }>
  ): QueryBuilder<TRecord, TResult>
  limit(
    limit: number,
    options?: string | Readonly<{ skipBinding?: boolean }>
  ): QueryBuilder<TRecord, TResult>

  // Aggregation
  count: AsymmetricAggregation<
    TRecord,
    TResult,
    Lookup<ResultTypes.Registry, 'Count', number | string>
  >
  countDistinct: AsymmetricAggregation<
    TRecord,
    TResult,
    Lookup<ResultTypes.Registry, 'Count', number | string>
  >
  min: TypePreservingAggregation<TRecord, TResult>
  max: TypePreservingAggregation<TRecord, TResult>
  sum: TypePreservingAggregation<TRecord, TResult>
  sumDistinct: TypePreservingAggregation<TRecord, TResult>
  avg: TypePreservingAggregation<TRecord, TResult>
  avgDistinct: TypePreservingAggregation<TRecord, TResult>

  increment(
    columnName: keyof TRecord,
    amount?: number
  ): QueryBuilder<TRecord, number>
  increment(columnName: string, amount?: number): QueryBuilder<TRecord, number>

  decrement(
    columnName: keyof TRecord,
    amount?: number
  ): QueryBuilder<TRecord, number>
  decrement(columnName: string, amount?: number): QueryBuilder<TRecord, number>

  // Others
  first: Select<
    TRecord,
    DeferredKeySelection.AddUnionMember<UnwrapArrayMember<TResult>, undefined>
  >

  pluck<K extends keyof TRecord>(column: K): QueryBuilder<TRecord, TRecord[K][]>
  pluck<TResult2 extends {}>(column: string): QueryBuilder<TRecord, TResult2>

  insert(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'insert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: '*',
    options?: DMLOptions
  ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>
  insert<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'insert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  insert<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'insert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  insert<
    TKey extends string,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'insert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  insert<
    TKey extends string,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'insert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  insert<TResult2 = number[]>(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'insert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'insert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>
  ): QueryBuilder<TRecord, TResult2>

  upsert(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'upsert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: '*',
    options?: DMLOptions
  ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>
  upsert<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'upsert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  upsert<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'upsert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  upsert<
    TKey extends string,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'upsert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  upsert<
    TKey extends string,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'upsert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>,
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  upsert<TResult2 = number[]>(
    data: TRecord extends CompositeTableType<unknown>
      ?
          | ResolveTableType<TRecord, 'upsert'>
          | ReadonlyArray<ResolveTableType<TRecord, 'upsert'>>
      : DbRecordArr<TRecord> | ReadonlyArray<DbRecordArr<TRecord>>
  ): QueryBuilder<TRecord, TResult2>

  modify<TRecord2 extends {} = any, TResult2 extends {} = any>(
    callback: QueryCallbackWithArgs<TRecord, any>,
    ...args: any[]
  ): QueryBuilder<TRecord2, TResult2>
  update<
    K1 extends StrKey<ResolveTableType<TRecord, 'update'>>,
    K2 extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      K2
    >[]
  >(
    columnName: K1,
    value: DbColumn<ResolveTableType<TRecord, 'update'>[K1]>,
    returning: K2,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  update<
    K1 extends StrKey<ResolveTableType<TRecord, 'update'>>,
    K2 extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      K2
    >[]
  >(
    columnName: K1,
    value: DbColumn<ResolveTableType<TRecord, 'update'>[K1]>,
    returning: readonly K2[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  update<K extends keyof TRecord>(
    columnName: K,
    value: DbColumn<TRecord[K]>
  ): QueryBuilder<TRecord, number>
  update<TResult2 = SafePartial<TRecord>[]>(
    columnName: string,
    value: Value,
    returning: string | readonly string[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  update(
    data: DbRecordArr<TRecord>,
    returning: '*',
    options?: DMLOptions
  ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>
  update<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ? ResolveTableType<TRecord, 'update'>
      : DbRecordArr<TRecord>,
    returning: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  update<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ? ResolveTableType<TRecord, 'update'>
      : DbRecordArr<TRecord>,
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  update<
    TKey extends string = string,
    TResult2 extends {}[] = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ? ResolveTableType<TRecord, 'update'>
      : DbRecordArr<TRecord>,
    returning: TKey | readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  update<
    TKey extends string,
    TResult2 extends {}[] = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    data: TRecord extends CompositeTableType<unknown>
      ? ResolveTableType<TRecord, 'update'>
      : DbRecordArr<TRecord>,
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  update<TResult2 = number>(
    data: TRecord extends CompositeTableType<unknown>
      ? ResolveTableType<TRecord, 'update'>
      : DbRecordArr<TRecord>
  ): QueryBuilder<TRecord, TResult2>

  update<TResult2 = number>(
    columnName: string,
    value: Value
  ): QueryBuilder<TRecord, TResult2>

  returning(
    column: '*',
    options?: DMLOptions
  ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>
  returning<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    column: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  returning<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.SetSingle<
      DeferredKeySelection.Augment<
        UnwrapArrayMember<TResult>,
        ResolveTableType<TRecord>,
        TKey
      >,
      false
    >[]
  >(
    columns: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  returning<TResult2 = SafePartial<TRecord>[]>(
    column: string | readonly (string | Raw)[] | Raw,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>

  onConflict<TKey extends StrKey<ResolveTableType<TRecord>>>(
    column: TKey
  ): OnConflictQueryBuilder<TRecord, TResult>
  onConflict<TKey extends StrKey<ResolveTableType<TRecord>>>(
    columns: readonly TKey[]
  ): OnConflictQueryBuilder<TRecord, TResult>

  onConflict(columns: string): OnConflictQueryBuilder<TRecord, TResult>

  onConflict(columns: string[]): OnConflictQueryBuilder<TRecord, TResult>

  onConflict(raw: Raw): OnConflictQueryBuilder<TRecord, TResult>

  onConflict(): OnConflictQueryBuilder<TRecord, TResult>

  del(
    returning: '*',
    options?: DMLOptions
  ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>
  del<
    TKey extends StrKey<TRecord>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    returning: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  del<
    TKey extends StrKey<TRecord>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2[]>
  del<TResult2 = SafePartial<TRecord>[]>(
    returning: string | readonly string[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  del<TResult2 = number>(): QueryBuilder<TRecord, TResult2>

  delete(
    returning: '*',
    options?: DMLOptions
  ): QueryBuilder<TRecord, DeferredKeySelection<TRecord, never>[]>
  delete<
    TKey extends StrKey<ResolveTableType<TRecord>>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      ResolveTableType<TRecord>,
      TKey
    >[]
  >(
    returning: TKey,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  delete<
    TKey extends StrKey<TRecord>,
    TResult2 = DeferredKeySelection.Augment<
      UnwrapArrayMember<TResult>,
      TRecord,
      TKey
    >[]
  >(
    returning: readonly TKey[],
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  delete<TResult2 = any>(
    returning: string | readonly (string | Raw)[] | Raw,
    options?: DMLOptions
  ): QueryBuilder<TRecord, TResult2>
  delete<TResult2 = number>(): QueryBuilder<TRecord, TResult2>

  truncate(): QueryBuilder<TRecord, void>
}
