# European residence / postcode support

Version: `europe-address-v1`. Changes are confined to the form and Railway proxy.

## Scope

The residence selector has 51 European/border-region countries, including Cyprus,
Kosovo, all microstates, Armenia, Azerbaijan, Georgia, Kazakhstan, Russia and Türkiye.
It also provides seven separately addressed European territories: AX, FO, GG, GI,
IM, JE and SJ. These are postal selections, not a claim of sovereign-state status.
Labels and alphabetical ordering follow DE/EN. There is no change to the original
agreement text or to the destination service's eligibility decisions.

Country codes:
AD AL AM AT AX AZ BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GE GG GI GR HR HU
IE IM IS IT JE KZ LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK
SM TR UA VA XK

## One validator

`address.mjs` is used by Node and embedded inline by `build.mjs` into the single
production HTML. `address-ui.js` updates country labels, postcode keyboard,
placeholder and validation. No address is sent to a third-party lookup service.
Postcodes are strings with leading zeros, letters, spaces and separators retained
where meaningful. `FIELDS.postal_code` now permits up to 16 input characters.

Examples: CY 2008; NL 1012 AB; GB SW1A 1AA; IE D6W X285; MT VLT 1117;
PL 00-001; PT 1000-001; CZ 110 00. Cyprus requires four digits, independently of
bank-country/IBAN. Copy/paste accepts lower-case, NBSP and matching optional country
prefixes. Only valid formats are canonicalised on blur and on the server; edits
are never erased on country switches. Format validation does not verify existence,
match a street/city, or infer payment or sanctions eligibility. Postal code remains
required by the existing application API contract, including IE (a form requirement,
not a claim that Ireland mandates Eircodes for all mail).

The DE/AT VAT-ID format checks are retained for those residences. Other countries
are no longer forced through the German pattern. Their existing type, length and
conditional-required checks remain; this is not full international tax validation.

## Reference material

UPU country sheets and postal operators are the authority for address formats:
- https://www.upu.int/en/Postal-Solutions/Programmes-Services/Addressing-Solutions
- CY: https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/cypEn.pdf
- MT: https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/mltEn.pdf
  (Includes personal postcodes that may differ from the usual three-letter prefix.)
- KZ: https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/kazEn.pdf
  (Both 6-digit and 7-character systems are accepted.)
- IE: https://www.eircode.ie/using-an-eircode
- Country-format/example cross-reference:
  https://github.com/google/libaddressinput/blob/master/cpp/src/region_metadata_constants.cc

This is versioned local configuration, not a live directory. Recheck postal
operator updates before changing a format. No country dataset or postcode directory
is bundled. The patterns are intentionally format-level, not exhaustive delivery
area/routing-key lists.

## Tests

`npm test`: 252 passing tests, including all previous IBAN/date/proxy checks.
`python test/browser-europe-address.py`: 64 new offline Chromium checks covering
320/390/768/1280 px, DE/EN, dark/light, postcode corrections, CY VAT, country edits,
review, sponsor lock and payload/PNG export.
Existing browser regressions: 54 international-IBAN checks and 14 date scenarios.
No live Base44 record is created by these tests; no secret values are accessed.

## Base44 boundary — action required in that app

The last operator-supplied Base44 API contract restricted country to DE/AT.
No Base44 code or entity is changed by this commit. That restriction must be
expanded there too; otherwise Base44 can still reject an otherwise valid CY etc.
request after the Railway checks pass. See `base44-europe-prompt.txt` for a prompt
that changes country/postal acceptance only, preserving authentication, assignment,
confirmations and field names. Do not substitute DE/AT for a real foreign address.
No new Railway variables are needed.
