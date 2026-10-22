const API = "https://api.frankfurter.app";
const $ = (id) => document.getElementById(id);
const currencyNames = { BRL:"Real brasileiro", USD:"Dólar americano", EUR:"Euro", GBP:"Libra esterlina", JPY:"Iene japonês", CHF:"Franco suíço", CAD:"Dólar canadense", AUD:"Dólar australiano", CNY:"Yuan chinês", SEK:"Coroa sueca", NZD:"Dólar neozelandês", NOK:"Coroa norueguesa", PLN:"Zloty polonês", MXN:"Peso mexicano", SGD:"Dólar de Singapura" };
const symbols = {BRL:"R$",USD:"US$",EUR:"€",GBP:"£",JPY:"¥",CHF:"CHF",CAD:"CA$",AUD:"A$",CNY:"¥",SEK:"kr",NZD:"NZ$",NOK:"kr",PLN:"zł",MXN:"MX$",SGD:"S$"};
let chart = null;
let currentRate = null;
let historyRates = [];
let quoteCache = {};

function formatNumber(value, digits=4) {
  return new Intl.NumberFormat("pt-BR", {minimumFractionDigits: digits, maximumFractionDigits: digits}).format(value);
}
function money(value, currency, digits=2) {
  try { return new Intl.NumberFormat("pt-BR", {style:"currency", currency, minimumFractionDigits:digits, maximumFractionDigits:digits}).format(value); }
  catch { return `${symbols[currency] || currency} ${formatNumber(value,digits)}`; }
}
function isoDate(date) { return date.toISOString().slice(0,10); }
function dateLabel(date) { return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short"}).format(date).replace(".",""); }
function showNotice(message) { const el=$("notice"); el.textContent=message; el.classList.remove("hidden"); }
function hideNotice() { $("notice").classList.add("hidden"); }
function setLoading(isLoading) {
  $("chartLoading").classList.toggle("loaded", !isLoading);
  $("chartLoading").innerHTML = '<span class="spinner"></span> Carregando histórico…';
}
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`A API respondeu com status ${response.status}.`);
  return response.json();
}
function getRange() {
  const end = new Date(); end.setDate(end.getDate()-1);
  const start = new Date(end); start.setDate(start.getDate()-29);
  return {start:isoDate(start), end:isoDate(end)};
}
async function loadDashboard() {
  hideNotice();
  $("refreshBtn").textContent = "…";
  $("updatedAt").textContent = "Atualizando dados…";
  setLoading(true);
  const base = $("baseCurrency").value;
  let quote = $("quoteCurrency").value;
  if (base === quote) {
    quote = base === "USD" ? "EUR" : "USD";
    $("quoteCurrency").value = quote;
  }
  $("pairLabel").textContent = `${base} / ${quote}`;
  $("chartPair").textContent = `${base} / ${quote}`;
  try {
    const {start,end} = getRange();
    const historyUrl = `${API}/${start}..${end}?from=${encodeURIComponent(base)}&to=${encodeURIComponent(quote)}`;
    const history = await fetchJSON(historyUrl);
    const entries = Object.entries(history.rates || {}).filter(([,v])=>Number.isFinite(v[quote])).sort(([a],[b])=>a.localeCompare(b));
    if (!entries.length) throw new Error("A API não retornou cotações para esse par no período.");
    historyRates = entries.map(([date,values])=>({date,value:values[quote]}));
    currentRate = historyRates[historyRates.length-1].value;
    const first = historyRates[0].value;
    const change = ((currentRate-first)/first)*100;
    const max = historyRates.reduce((a,b)=>a.value>b.value?a:b);
    const min = historyRates.reduce((a,b)=>a.value<b.value?a:b);
    $("currentRate").textContent = formatNumber(currentRate,4);
    $("periodChange").textContent = `${change>=0?"+":""}${formatNumber(change,2)}%`;
    $("changeBadge").textContent = change>=0 ? "Alta no período" : "Queda no período";
    $("changeBadge").classList.toggle("negative", change<0);
    $("maxRate").textContent = formatNumber(max.value,4);
    $("minRate").textContent = formatNumber(min.value,4);
    $("maxDate").textContent = `Em ${dateLabel(new Date(max.date+"T12:00:00"))}`;
    $("minDate").textContent = `Em ${dateLabel(new Date(min.date+"T12:00:00"))}`;
    $("chartRange").textContent = `${dateLabel(new Date(entries[0][0]+"T12:00:00"))} — ${dateLabel(new Date(entries[entries.length-1][0]+"T12:00:00"))}`;
    renderChart();
    await loadOtherRates(base, quote);
    await updateConversion();
    $("updatedAt").textContent = `Atualizado às ${new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit"}).format(new Date())}`;
    $("todayLabel").textContent = new Intl.DateTimeFormat("pt-BR",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}).format(new Date());
  } catch (error) {
    showNotice(`Não foi possível carregar os dados da API. ${error.message} Verifique sua conexão e tente novamente.`);
    $("chartLoading").classList.remove("loaded");
    $("chartLoading").textContent = "Histórico indisponível. Tente atualizar.";
    $("updatedAt").textContent = "Falha na atualização";
  } finally { $("refreshBtn").textContent = "↻"; }
}
function renderChart() {
  const ctx = $("rateChart").getContext("2d");
  const gradient = ctx.createLinearGradient(0,0,0,270);
  gradient.addColorStop(0,"rgba(37,185,154,.22)"); gradient.addColorStop(1,"rgba(37,185,154,0)");
  if (chart) chart.destroy();
  chart = new Chart(ctx,{
    type:"line",
    data:{labels:historyRates.map(p=>dateLabel(new Date(p.date+"T12:00:00"))),datasets:[{data:historyRates.map(p=>p.value),borderColor:"#25b99a",backgroundColor:gradient,fill:true,borderWidth:2.5,tension:.35,pointRadius:0,pointHoverRadius:5,pointHoverBackgroundColor:"#25b99a",pointHoverBorderColor:"#fff",pointHoverBorderWidth:2}]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:"index"},plugins:{legend:{display:false},tooltip:{backgroundColor:"#142537",padding:11,displayColors:false,titleFont:{family:"DM Sans",size:10},bodyFont:{family:"Manrope",size:12,weight:"700"},callbacks:{label:(context)=>`${formatNumber(context.raw,4)} ${$("quoteCurrency").value}`}}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:"#9aa5b3",font:{family:"DM Sans",size:9},maxTicksLimit:7}},y:{grid:{color:"#eff2f6",drawTicks:false},border:{display:false,dash:[3,4]},ticks:{color:"#9aa5b3",font:{family:"DM Sans",size:9},maxTicksLimit:5,padding:10,callback:(v)=>formatNumber(v,2)}}}}
  });
  $("chartLoading").classList.add("loaded");
}
async function loadOtherRates(base, quote) {
  const targets = ["USD","EUR","GBP","JPY","CHF","CAD","AUD","BRL"].filter(c=>c!==base).slice(0,5);
  const data = await fetchJSON(`${API}/latest?from=${encodeURIComponent(base)}&to=${encodeURIComponent(targets.join(","))}`);
  quoteCache = {...quoteCache, ...data.rates, [base]:1};
  $("currencyList").innerHTML = targets.map(code=>{
    const rate=data.rates[code];
    return `<div class="currency-row"><div class="currency-flag">${code}</div><div class="currency-name"><strong>${currencyNames[code]||code}</strong><small>${base} → ${code}</small></div><div class="currency-rate">${rate?formatNumber(rate,4):"—"}<small>1 ${base} = ${code}</small></div></div>`;
  }).join("");
}
async function updateConversion() {
  const from=$("converterFrom").value, to=$("converterTo").value;
  const amount=Number($("amountInput").value);
  $("fromSymbol").textContent=symbols[from]||from;
  if (!Number.isFinite(amount)||amount<0) { $("convertedValue").textContent="Informe um valor válido"; $("conversionRate").textContent=""; return; }
  try {
    let rate;
    if (from===to) rate=1;
    else {
      const result=await fetchJSON(`${API}/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      rate=result.rates[to];
    }
    if (!Number.isFinite(rate)) throw new Error("Taxa não disponível");
    $("convertedValue").textContent=money(amount*rate,to,2);
    $("conversionRate").textContent=`1 ${from} = ${formatNumber(rate,4)} ${to} · taxa de referência`;
  } catch {
    $("convertedValue").textContent="Indisponível";
    $("conversionRate").textContent="Não foi possível consultar essa conversão.";
  }
}
$("refreshBtn").addEventListener("click",loadDashboard);
$("applyFilters").addEventListener("click",loadDashboard);
$("baseCurrency").addEventListener("change",()=>{ $("converterFrom").value=$("baseCurrency").value; loadDashboard(); });
$("quoteCurrency").addEventListener("change",loadDashboard);
$("amountInput").addEventListener("input",updateConversion);
$("converterFrom").addEventListener("change",updateConversion);
$("converterTo").addEventListener("change",updateConversion);
$("swapCurrencies").addEventListener("click",()=>{const from=$("converterFrom").value;$("converterFrom").value=$("converterTo").value;$("converterTo").value=from;updateConversion();});
$("menuToggle").addEventListener("click",()=> $("sidebar").classList.toggle("open"));
document.querySelectorAll(".nav-item").forEach(link=>link.addEventListener("click",()=> $("sidebar").classList.remove("open")));
loadDashboard();
