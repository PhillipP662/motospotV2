window.onload=function(){
    document.getElementById('play').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('audio').play();
    });
}