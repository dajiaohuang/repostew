# Huginn/huginn

## `Service.by_name` direction validation

The reviewer suggested `scope :by_name, ->(dir = :desc) { order(name: dir) }` for PR #3759. Huginn pins ActiveRecord 8.1.3.1. That version validates order-hash values against `asc`/`desc` (including supported case variants) before building the Arel order clause, so using the structured API prevents an untrusted direction from becoming SQL. The existing `User#services` association passes the string `"asc"`; preserve that supported call and the descending default. [Review suggestion](https://github.com/huginn/huginn/pull/3759#discussion_r4177310565), [ActiveRecord 8.1.3.1 implementation](https://github.com/rails/rails/blob/v8.1.3.1/activerecord/lib/active_record/relation/query_methods.rb#L1948-L1994).

Regression coverage should exercise both requested ascending and default descending order and confirm an invalid direction raises `ActiveRecord::UnknownAttributeReference` on the pinned Rails version. Do not assume `ArgumentError` or rely on a newer Rails version's behavior for this contract.
