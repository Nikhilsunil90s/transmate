
purge_cloudflare() {
  echo "purge cloudflare cache "
  curl -X POST "https://api.cloudflare.com/client/v4/zones/4d21fbf35eba1ee7dcb1bc1e58fe4e8d/purge_cache" \
     -H "Authorization: Bearer ${CLOUDFLARE_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
}
# when run on command line
if [ "$2" = "run" ]; then
  echo "start cache purge"
  purge_cloudflare
fi