# International IBAN support

Only bank-account validation changes. Residence remains DE/AT, matching the
existing applicant/API contract. An account's country is its IBAN prefix, never
`country` from the applicant address. BIC validation stays international (8/11
characters). Field names, secrets, project/user/sponsor mapping are unchanged.

`iban.mjs` is the single pure validator for the Node server and the compiled
single-file browser form. Build embeds it inline; no bank details are sent to a
third-party validator. Entries permit spaces (including copied NBSP), lowercase
ASCII and leading zeroes. Payloads use uppercase strings without spaces.
Unknown prefixes, incorrect lengths, BBAN character classes and check digits
are rejected; MOD-97 is mandatory. Account ownership/existence, currencies,
bank-specific reachability and payment/sanctions eligibility are NOT inferred.

## Reference snapshot

Coverage: the 89 IBAN prefixes listed in SWIFT IBAN Registry Release 102,
June 2026, checked on 2026-09-08. The register is not bundled or republished.
- https://www.swift.com/standards/data-standards/iban-international-bank-account-number
- https://www.swift.com/swift-resource/9606/download (release 102 PDF)
- Format metadata cross-check: the schwifty maintainers' generated registry,
  https://raw.githubusercontent.com/mdomke/schwifty/main/schwifty/iban_registry/generated.json
  SHA-256 4b25b3f6c334c60da9f426dcad835d1b2a082bba8d81ab119d1671e74c060ce8
- That generated snapshot has 87 distinct prefixes. HN (28, 4!a20!n) and
  YE (30, 4!a4!n18!c) are added from SWIFT pages 41 and 96. They must not be
  dropped during future updates. Aliases using FR, FI or GB prefixes do not
  create separate fictitious IBAN prefixes.

The tiny factual format table is local versioned configuration, not a live
service or an automatic registry updater. Reconcile it with future registry
changes and run the regression tests before deployment.

## Verification

`npm test` includes shared browser/server validator parity, per-prefix positive
and negative syntax/checksum cases, published example IBANs, cross-residence
accounts, normalisation and server forwarding with a stubbed Base44 endpoint.
`npm run build` then `python test/browser-international-iban.py` checks mobile
DE/EN dark/light flows, editing, review and request payloads entirely offline.
No live application is submitted and no live Base44 schema/function is modified.

The Base44 `iban` field must remain a string and must not have a DE/AT-only
pattern or residence-country coupling. This deployment changes the Railway
side only. Remote storage acceptance requires a separately confirmed submission.
