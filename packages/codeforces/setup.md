cd packages
cd codeforces

npm install
# Terminal 1
npm run worker
# Terminal 2
npm run dev
# Test
curl -s http://localhost:4001/cf/tourist 
# Wait ~30s then:
redis-cli KEYS "cf:*"
# Should show: cf:snapshot:tourist