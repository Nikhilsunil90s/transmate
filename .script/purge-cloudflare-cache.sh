#!/bin/sh
curl -X POST "https://api.cloudflare.com/client/v4/zones/4d21fbf35eba1ee7dcb1bc1e58fe4e8d/purge_cache" \
     -H "Authorization: Bearer $CLOUDFLARE_PURGE" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'