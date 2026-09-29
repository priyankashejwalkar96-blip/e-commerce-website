const http = require('http');

http.get('http://localhost:3000/products', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('HTML STATUS:', res.statusCode);
    const cssMatches = data.match(/href=["']([^"']+\.css[^"']*)["']/g);
    console.log('CSS HREFs:', cssMatches);
    if (cssMatches && cssMatches.length > 0) {
      const cssPath = cssMatches[0].match(/href=["']([^"']+)["']/)[1];
      console.log('Fetching CSS path:', cssPath);
      http.get('http://localhost:3000' + cssPath, (cssRes) => {
        let cssData = '';
        cssRes.on('data', c => cssData += c);
        cssRes.on('end', () => {
          console.log('CSS STATUS:', cssRes.statusCode);
          console.log('CSS BYTE LENGTH:', cssData.length);
          console.log('CSS HEAD SNIPPET:', cssData.substring(0, 200));
        });
      });
    }
  });
});
