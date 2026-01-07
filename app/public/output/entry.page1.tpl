<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/static/logo.ico" />
  <link rel="stylesheet" href="/static/normalize.css" />
  <title>{{ title }}</title>
</head>
<body style="color: blue;">
  <h1>Page1</h1>
  <h3>name: {{ name }}</h3>
  <input id="env" value="{{env}}" style="display: none;" />
  <input id="options" value="{{options}}" style="display: none;" />
  <button onclick="handleClick()">发送请求</button>
  
  <script src="https://cdn.bootcss.com/axios/0.18.0/axios.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/js-md5@0.8.3/src/md5.min.js"></script>
  <script type="text/javascript">
    try {
      window.env = document.querySelector('#env').value;
      window.options = JSON.parse(document.querySelector('#options').value || '{}');
    } catch (error) {
      
    }

    function handleClick() {
      const signKey = 'asfnaosfja487hasfh3898has9e82hfh3';
      const st = Date.now();
      axios.request({
        method: 'get',
        url: '/api/project/list',
        data: { page: 1, size: 2 },
        headers: {
          s_t: st,
          s_sign: md5(`${signKey}_${st}`)
        }
      }).then((res) => {
        console.log(res);
      })
      // axios.get('/api/project/list').then((res) => {
      //   console.log(res);
      // })
      // axios({
      //   method: 'POST',
      //   url: '/api/project/list',
      //   data: { a: 1, b: 2, c: 3}
      // }).then((res) => {
      //   console.log(res);
      // })
    }
  </script>
</body>
</html>