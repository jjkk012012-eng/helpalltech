const DATA = window.AGRIFOOD_CANDIDATE_DATA || {factories:[], stats:{regions:[], categories:[], recommendations:[]}};
const F = DATA.factories || [];
const S = DATA.stats || {};
const $ = s => document.querySelector(s);
const fmt = n => Number(n || 0).toLocaleString('ko-KR');
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let current = [];

function shortRegion(v){return String(v||'').replace('특별자치도','').replace('특별자치시','').replace('특별시','').replace('광역시','').replace('도','');}
function maxOf(list){return Math.max(...list.map(x=>x[1]||0),1)}
function barHtml(list, limit=10){
  const rows = (list||[]).slice(0,limit), max = maxOf(rows);
  return rows.map(([name,value])=>`<div><div class="barTop"><b>${esc(name)}</b><span>${fmt(value)}</span></div><div class="barTrack"><div class="barFill" style="width:${Math.max(5,value/max*100)}%"></div></div></div>`).join('');
}
function rankHtml(list, limit=5){
  const rows=(list||[]).slice(0,limit), max=maxOf(rows);
  return rows.map(([name,value])=>`<div class="rankItem"><div class="rankItemTop"><b>${esc(name)}</b><span>${fmt(value)}</span></div><div class="track"><div class="fill" style="width:${Math.max(6,value/max*100)}%"></div></div></div>`).join('');
}
function tilesHtml(list, limit=15){
  const rows=(list||[]).slice(0,limit), max=maxOf(rows);
  return rows.map(([name,value],i)=>`<article class="clusterTile" style="--a:${(0.05+(value/max)*0.20).toFixed(3)}"><b>${esc(shortRegion(name))}</b><strong>${fmt(value)}</strong><small>${i+1}위 후보군</small></article>`).join('');
}
function unique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ko'))}
function options(arr){return arr.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}
function init(){
  const total = S.candidateFactories || F.length;
  $('#heroTotal').textContent = fmt(total);
  $('#heroSearchable').textContent = fmt(total);
  $('#heroCategoryTypes').textContent = fmt((S.categories || []).length) + '개';
  $('#heroRecTypes').textContent = fmt((S.recommendations || []).length) + '개';
  $('#heroRecs').innerHTML = rankHtml(S.recommendations,5);
  $('#kTotal').textContent = fmt(total);
  $('#kSmall').textContent = fmt(S.smallCompanies || 0);
  $('#kAvg').textContent = `${fmt(S.avgEmployee || 0)}명`;
  $('#kCats').textContent = fmt((S.categories||[]).length);
  $('#regionBars').innerHTML = barHtml(S.regions,10);
  $('#categoryBars').innerHTML = barHtml(S.categories,10);
  $('#clusterBoard').innerHTML = tilesHtml(S.regions,15);
  $('#policyBars').innerHTML = rankHtml(S.recommendations,6);
  $('#region').innerHTML = '<option value="">전체 지역</option>' + options(unique(F.map(x=>x.sido)));
  $('#category').innerHTML = '<option value="">전체 품목군</option>' + options(unique(F.map(x=>x.category)));
  $('#recommend').innerHTML = '<option value="">전체 추천유형</option>' + options(unique(F.flatMap(x=>x.recommendations||[])));
  updateSigungu();
  ['q','region','sigungu','category','recommend'].forEach(id=>$('#'+id).addEventListener('input', render));
  $('#region').addEventListener('input', updateSigungu);
  $('#clusterMode').addEventListener('input', e=>{$('#clusterBoard').innerHTML = tilesHtml(e.target.value === 'category' ? S.categories : S.regions,15)});
  render();
}
function updateSigungu(){
  const r=$('#region').value, before=$('#sigungu').value;
  const list=unique(F.filter(x=>!r || x.sido===r).map(x=>x.sigungu));
  $('#sigungu').innerHTML='<option value="">전체 시군구</option>'+options(list);
  if(list.includes(before)) $('#sigungu').value=before;
}
function render(){
  const q=$('#q').value.trim().toLowerCase();
  const r=$('#region').value, g=$('#sigungu').value, c=$('#category').value, rec=$('#recommend').value;
  current=F.filter(x=>(!q || [x.company,x.product,x.material,x.industry,x.address,x.sido,x.sigungu,x.category].join(' ').toLowerCase().includes(q)) && (!r||x.sido===r) && (!g||x.sigungu===g) && (!c||x.category===c) && (!rec||(x.recommendations||[]).includes(rec)));
  $('#count').textContent=fmt(current.length);
  const limit=90;
  $('#limitNote').textContent=current.length>limit?`화면에는 상위 ${fmt(limit)}개만 표시됩니다.`:'';
  $('#cards').innerHTML=current.slice(0,limit).map(cardHtml).join('') || '<article class="companyCard"><h3>검색 결과가 없습니다.</h3><p class="addr">검색어 또는 필터를 조정해 주세요.</p></article>';
}
function cardHtml(x){
  const recs=(x.recommendations||[]).slice(0,4).map(v=>`<span class="tag">${esc(v)}</span>`).join('');
  return `<article class="companyCard">
    <div class="companyHead"><div><h3>${esc(x.company||'-')}</h3><p class="addr">${esc(x.address||'-')}</p></div><span class="score">${Math.round((x.confidence||0)*100)}%</span></div>
    <div class="tags"><span class="tag">${esc(x.sido||'-')}</span><span class="tag">${esc(x.sigungu||'-')}</span><span class="tag">${esc(x.category||'기타')}</span><span class="tag">${esc(x.size||'규모 미상')}</span></div>
    <div class="infoGrid">
      <div><b>생산품</b><span>${esc(x.product||'-')}</span></div>
      <div><b>원자재</b><span>${esc(x.material||'-')}</span></div>
      <div><b>업종명</b><span>${esc(x.industry||'-')}</span></div>
      <div><b>추천</b><span class="tags">${recs || '-'}</span></div>
    </div>
  </article>`;
}
init();
