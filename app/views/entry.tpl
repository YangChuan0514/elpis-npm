<!DOCTYPE html>
<html lang="zh">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/static/logo.ico" />
  <link rel="stylesheet" href="/static/normalize.css" />
  <title>{{ title }}</title>
</head>

<!-- <body style="color: blue; margin: 0;"> -->
<body style="margin: 0;">
  <div id="root"></div>

  <input id="env" value="{{env}}" style="display: none;" />
  <input id="options" value="{{options}}" style="display: none;" />
  <input id="projKey" value="{{projKey}}" style="display: none;" />

  <script type="text/javascript">
    try {
      window.env = document.querySelector('#env').value;
      window.options = JSON.parse(document.querySelector('#options').value || '{}');
      window.projKey = document.querySelector('#projKey').value;
    } catch (error) {
      console.log(error);
    }
  </script>
</body>

</html>