# riebl/vanetza

- ChunkPacket transport layers hold only BTP headers and may store arbitrary byte-convertible objects; header parsing makes a true struct copy and must not erase/replace that layer to imitate CohesivePacket. [Contract feedback](https://github.com/riebl/vanetza/issues/320#issuecomment-6036622990).

- ASN.1 support runtime comes from the asn1c compiler; fixes belong to its canonical source, not a downstream output-only patch. [Source routing](https://github.com/riebl/vanetza/pull/325#issuecomment-6036108624).
