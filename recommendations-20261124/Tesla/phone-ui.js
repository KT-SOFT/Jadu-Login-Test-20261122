// 목차: 첫 곡 재생 → 화면 표시 갱신. 계정·재생 엔진은 기존 방식 유지.
(()=>{
 document.addEventListener('DOMContentLoaded',()=>{
  const style=document.createElement('style');
  style.textContent='body #h-content .song-row,body #h-content .song-row *{-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}body #h-content .song-row .row-play,body #h-content .song-row .artist-link,body #h-content .song-row .row-play:hover,body #h-content .song-row .artist-link:hover,body #h-content .song-row .row-play:focus,body #h-content .song-row .row-play:active,body #h-content .song-row .artist-link:focus,body #h-content .song-row .artist-link:active{background:transparent!important;color:inherit!important;outline:none!important;box-shadow:none!important;filter:none!important}body #h-content .song-row ::selection{background:transparent!important;color:inherit!important}body #h-content .home-artists .artist-card{align-items:center;text-align:center}body #h-content .song-row ::selection{background:transparent!important;color:inherit!important}body #h-content .home-artists .artist-card>span{width:100%;text-align:center}body #h-content .back-heading button>span{display:none!important}body #app-startup-notice{background:#21372a!important;color:#e8f3eb!important;border-color:#4a6853!important}';
  document.head.append(style);
  const content=document.getElementById('h-content'),play=document.getElementById('h-play'),title=document.getElementById('h-now-title');
  const idle=()=>!title?.textContent.trim()||title.textContent.replace(/\s/g,'')==='노래를골라주세요';
  const update=()=>{
   if(!content)return;
   if(play&&idle()){const disabled=!content.querySelector('.song-list .song-row .row-play:not(:disabled)');if(play.disabled!==disabled)play.disabled=disabled;}
  };
  document.addEventListener('click',event=>{
   if(!event.target.closest?.('#h-play')||!idle())return;
   const first=content?.querySelector('.song-list .song-row .row-play:not(:disabled)');
   if(first){event.preventDefault();event.stopImmediatePropagation();first.click();}
  },true);
  new MutationObserver(update).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});update();
 });
})();
