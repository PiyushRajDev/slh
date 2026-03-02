console.time('fetch');
fetch('https://api.github.com/repos/PiyushRajDev/slh')
  .then(r => { console.log(r.status); console.timeEnd('fetch'); })
  .catch(e => { console.error(e); console.timeEnd('fetch'); });
