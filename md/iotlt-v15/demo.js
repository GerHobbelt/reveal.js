window.onload = () => {
  const milkcocoa = new MilkCocoa('oniolavi4s.mlkcca.com');
  const ds = milkcocoa.dataStore('command');

  // ボタン
  const forward = document.getElementById('forward');
  const back = document.getElementById('back');
  const left = document.getElementById('left');
  const right = document.getElementById('right');

  // コマンド履歴
  const timeline = document.getElementById('timeline');

  forward.addEventListener('click', (e) => {
    ds.send({command: 'f'});
  });
  back.addEventListener('click', (e) => {
    ds.send({command: 'b'});
  });
  left.addEventListener('click', (e) => {
    ds.send({command: 'l'});
  });
  right.addEventListener('click', (e) => {
    ds.send({command: 'r'});
  });

  ds.on('send', (data) => {
    console.log(data.value);
    const child = document.createElement('div');
    child.innerHTML = data.value['command']
    timeline.insertBefore(child, timeline.firstChild);
  })

}
