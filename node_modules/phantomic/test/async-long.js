setTimeout(function () {
  console.log('1');
  setTimeout(function () {
    console.log('2');
    setTimeout(function () {
      console.log('3');
      setTimeout(function () {
        console.log('4');
        setTimeout(function () {
          console.log('5');
        }, 50);
      }, 50);
    }, 50);
  }, 50);
}, 50);
