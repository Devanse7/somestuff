/* v 1.0 10 Jul 20 */
function isNum(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

const CHECK_ORDER_UPDATE_TIME = 30000;

const isEu = window.location.href.match('game=2522') ||  window.location.href.match('game=27815'); // if true - EU, otherwise - US
var paused = false;
var US_GOLD = "wow-us/gold-2299-19249";
var EU_GOLD = "wow-eu/gold-2522-19248";
/* var US_GOLD_CL = "wow-us/gold-27816-27825";
var EU_GOLD_CL = "wow-eu/gold-27815-27817"; */
var US_GOLD_CL = "wow-classic-us/gold-27816-27825";
var EU_GOLD_CL = "wow-classic-eu/gold-27815-27817";
var activeListing = {};
var monitorMin = {};
var parseIv;
var myUserName;
var servers = {};
function getDoc(url,onLoad) { // service function to do queries
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        onLoad(this.responseText);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}
function saveListing(argument) { // helper function to save <____> to local storage
    localStorage.setItem('listingMin',JSON.stringify(activeListing))
}
function saveMonitor(argument) {  // helper function to save <____> to local storage
    localStorage.setItem('monitorMin',JSON.stringify(monitorMin))
}
function setMin(id,minAccepter) {
    var min = prompt()
    var isn = isNum(min);
    if(!isn) {
        return alert('Not a number')
    }
    if(min <= 0) 
    delete activeListing[id];
    else activeListing[id] = min;
    minAccepter.text(min);
    saveListing();
}
var tel_post_options = {
  host: 'api.telegram.org',
  port: '443',
  path: '',
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  }
};

const msgThrottle = {

}

function notifyPrice(price,server,info,lessThan,hOrA="") {

  const hash = price + '' + server + '' + info + '' + lessThan;
  const nowt = Date.now();
  if(msgThrottle[hash] && (nowt-msgThrottle[hash] < 5*60000))
    return;

  msgThrottle[hash] = nowt ;
  jQuery.ajax({
    method: 'POST',
    url: 'https://api.telegram.org/bot771747860:AAHSK4UkkLxUf5sjt7Iu-fVZrRqbQemf0Ls/sendMessage',
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify  ({
              "chat_id":"-1001418449133",
              "parse_mode": "Markdown",
              "text": `
"Sweet" low price 🍬
=======
- _On server_: *${server} (${isEu?'EU':'US'}) [${hOrA.trim()}]*
- _Found from_: *${info}*
- (Less than *${lessThan}*)`
          })
  })
}

function notifyOrder(count) {
  jQuery.ajax({
    method: 'POST',
    url: 'https://api.telegram.org/bot771747860:AAHSK4UkkLxUf5sjt7Iu-fVZrRqbQemf0Ls/sendMessage',
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify  ({
              "chat_id":"-1001418449133",
              "parse_mode": "Markdown",
              "text": `☑️ Orders state changed. *${count}* pending`
          })
  })
}

let last_t_order;

const orderCheck = async function () {
    const resp = await jQuery.get('https://www.g2g.com/userBar/countNotice?_='+Date.now())
    let {t_order} = JSON.parse(resp);
    if(t_order && t_order > 0 && t_order!=last_t_order) {
      notifyOrder(t_order);
    }
    last_t_order = t_order;
}
setInterval(orderCheck,CHECK_ORDER_UPDATE_TIME);
orderCheck();

function setMonitorMin(id,minMonAccepter) {
    var min = prompt('',monitorMin[id])
    var isn = isNum(min);
    if(!isn ||min <= 0) 
    delete monitorMin[id];
    else monitorMin[id] =+min;
    minMonAccepter.text(min);

    saveMonitor();
}
function downPrecision(a) {
  if(!isNum(a)) throw "Err";
  var e = 1;
  while (Math.round(a * e) / e !== a) e *= 10;
  return e<1000000 ? e*10 : e;
}
// const dataPath = 'div.other-seller-offeer_mainbox > form > div:nth-child(3) > span > span:nth-child(1)';
const dataPath = 'div.other-seller-offeer_mainbox';
var rowPriceSelector = '.offer-price-amount '+dataPath;
var getPriceFromRow = $el => $el.find(rowPriceSelector).data('ppu')
var tasksForParse = [], piv;
const nameAndPriceFromRow = el => '['+$(el).find('.seller__name-detail').text().trim()+'] '+$(el).find(dataPath).get(0).dataset.ppu
const isClassic = _ => $('.profile-heading .current-listing > h3').text().match(/lassic/);



function updPriceByTask(task,i,last_i) {
    jQuery.get(task.url).done( data => {
        let bans = [], qtyBan = 0;

        try {
            bans = $('#parser_banned').val().split(';').map( sn => sn.trim());
            qtyBan = $(`#parser_banned_qty${isClassic()?'_c' : ''}`).val();
        } catch(e) {

        }
        var $data = $(data).filter('span').filter(function(idx,el) {
            const seller = $(el).find('.seller__name-detail').text().trim(),
                qty = $(el).find('.products__statistic-amount').data('fcQty');
            return bans.indexOf(seller) < 0 && qty > qtyBan;
        }).slice(0,7).sort( (row2,row1) => getPriceFromRow($(row2)) > getPriceFromRow($(row1)));
		
        var $dataWoBan = $(data).filter('span').slice(0,7).sort( (row2,row1) => getPriceFromRow($(row2)) > getPriceFromRow($(row1)));

        var $fr = $data.eq(0)
        var id = task.listingId;
        var date = new Date();
		    
        var bestPrices = "Bests: <" + Array.prototype.map.call($dataWoBan.find('.products__row'), nameAndPriceFromRow).join("; ") + ">";
        var fDate = date.toString().slice(0,24);
        
        
        console.log('$data' +$data);

        bestPrices = task.sName + " (" + fDate + ") " + bestPrices;
        var $log = $("#"+id+"_plog");
        $("#"+id+"_plog").find(".current-bests").text(bestPrices);
        var currMin = getPriceFromRow($fr);
        if($fr.find('.seller__name-detail').text().trim() == myUserName)  {
            $log.find('.status').text(fDate + " *** we first with price: " + currMin);
            $fr = $data.eq(1);
        }
        var currMin = $fr.find(rowPriceSelector).data('ppu');
        console.log('Min '+currMin);
        if(monitorMin[id] && currMin <= monitorMin[id]) {
          const hOrA = $("#"+id).find('.products__title.multiline__ellipsis').text().split(' > ')[2];
          notifyPrice(currMin,task.sName,nameAndPriceFromRow($fr),monitorMin[id],hOrA);
        }
        if($("#"+id).find('.manage-listing__actions-list a').text().trim() == 'Relist')  {
            $log.text('Skip not active');
            console.log('Skip not active');
            return;
        }

        var ttt = Math.random().toString().slice(3,8);
        var $currEdit = $("#"+id+" .g2g_products_price.editable.editable-click");
        var currPrice = parseFloat($currEdit.text());
        var toPrice = 0;
        var targetMin = +(currMin - 1/downPrecision(currMin)).toFixed(6);
        var ourMin = activeListing[id];
	if(!ourMin) {
          $log.find('.status').text(" curr min " + currMin +"; our price not set");
	  return; 
	}
        if(targetMin >= ourMin) {
            toPrice = targetMin;
        } else {
            toPrice  = ourMin;
        }
        $log.find('.status').text(" curr min " + currMin +" --> we set: " + toPrice);;

        if( toPrice != currPrice) {
            $currEdit.get(0).click();
            setTimeout(function() {
                var $pi = $(".editable-input  input");
                $pi.val(toPrice);

                setTimeout(function() {
                    $('.btn.editable-submit').get(0).click();
                    setTimeout(function() {
                        $('.btn.editable-cancel').get(0).click();
						if(i==last_i)
							$('.manage').css('background-color','');
                    },500)
                },700)
            },700);
        } else {
            if(currPrice==currMin) $log.find('.status').text(fDate + " *** we still first with price: " + currPrice);
            else $log.find('.status').text(fDate + " *** we _NOT_ first with price: " + currPrice);
        }
    })
}
function doTasks() {
	if(paused)
		return; // R E T U R N !!!
	$('.manage').css('background-color','#ffdede');
    var activeTasks = tasksForParse;//.filter( t => activeListing[t.listingId] )
	var _li = activeTasks.length - 1;
    for (var i = 0; i < activeTasks.length; i++) {
        var task = activeTasks[i];
        setTimeout((function(_task,_i) {
            return function() {

                updPriceByTask(_task,_i,_li)
            }
        })(task,i), i*3000)
    }
}
function startParsing() {
    clearInterval(piv);
	doTasks();
    parseIv = setInterval(doTasks,240000)
}

function prepareListing() {
    var listingMin = localStorage.getItem('listingMin') || {};
    if(listingMin.length) listingMin = JSON.parse(listingMin);
    activeListing = listingMin;

    var monMin = localStorage.getItem('monitorMin') || {};
    if(monMin.length) monMin = JSON.parse(monMin);
    monitorMin = monMin;

    setTimeout(startParsing, 5000);
    $(".manage__table-row").each(function(i,el){
        var $el = $(el), id = el.id;
        if(!id) return;
        var $log = $("<div id='"+id+"_plog'><textarea class='current-bests' style='height:auto' rows='2'></textarea><div class='status'></div></div>");
        var $log_wr = $("<tr><td colspan='6'></td></tr>");
        $log_wr.find('td').append($log);
        $el.after($log_wr);
        var snps = $el.find('.products__name').text().split(/[-.^>]/);
        

        if(snps.length!=3) return $log.append('<br>' + 'Parser fail:10')
        var game = snps[0],
            serverId,
            country, 
            sName = snps[1].trim();
        switch(true) {
            case game.indexOf('US')>0:
                country = 'US';
                break;
            case game.indexOf('EU')>0:
                country = 'EU';
                break;
        }
	
	
		var servername = $el.find('.products__name').text();
		var serverIdn;

        
        var country = snps[0];
        var resservername = snps[1];
        var faction = snps[2];
       
        // $log.append('<br>' + ' dataPath: '+ dataPath)
        // $log.append('<br>' + '  getPriceFromRow: '+ rowPriceSelector)
        // $log.append('<br>' + '  getPriceFromRow: '+ getPriceFromRow)
        // $log.append('<br>' + '  tasksForParse: '+ tasksForParse)
        // $log.append('<br>' + '  nameAndPriceFromRow: '+ nameAndPriceFromRow)
      //  $log.append('<br>' + ' seller: '+seller)
        // $log.append('<br>' + ' seller: '+data)
        
        
        
        if (snps[0].match(/EU/))
        {            
                if (snps[2].match(/Alliance/))
                {
                    if (snps[1].match(/Antonidas/))
                    {
                        var parseUrl = "https://www.g2g.com/offer/Antonidas--DE----Alliance?service_id=lgc_service_1&brand_id=lgc_game_2299&region_id=ac3f85c1-7562-437e-b125-e89576b9a38e&fa=lgc_2299_dropdown_17%3Algc_2299_dropdown_17_41740&q=ant&sort=lowest_price&include_offline=0"
                    }
                }


        }
        if (snps[0].match(/US/))
        {
            $log.append('<br>' + ' Our Faction: '+reszone)

        }
  
        $log.before('Parser started');
        $log.before('<a target="_blank" href="'+parseUrl+'"> Will parse: '+parseUrl+"</a>")
        // price
        var minSaved = listingMin[id];
        var isn = minSaved && isNum(minSaved);
        if(minSaved && isn) activeListing[id] = minSaved;
        var minAccepter = $("<a class='ghmin' href='javascript:'/>");
        minAccepter.text(isn && minSaved || 'click to set min');
        minAccepter.click(function() {setMin(id,minAccepter,$log)})
        $el.find(".manage__table-actions-detail")
            .append(minAccepter)

        minSaved = monMin[id];
        var isn = minSaved && isNum(minSaved);
        if(minSaved && isn) monitorMin[id] = +minSaved;

        var minMonWr = $("<div>Telegram notify if &lt;: </div>");
        var minMonAccepter = $("<a class='ghminmon' href='javascript:'/>");
        minMonAccepter.text(isn && minSaved || 'click to set min');
        minMonAccepter.click(function() {setMonitorMin(id,minMonAccepter,$log)})
        minMonWr.append(minMonAccepter);
        $el.find(".manage__table-actions-detail")
            .append(minMonWr)
        
        tasksForParse.push({url:parseUrl,listingId:id, sName: sName})
    });
    saveListing();
    saveMonitor();
    
}
function extractServers(country,data) {
    var srvs = Array.prototype.slice.call($(data).find('select[name=server] option').map(function() { return {name:this.textContent,id:this.value }}),0)
    var sMap = srvs.reduce( (acc,next) => {return acc[next.name] = next.id, acc} ,{})
    servers[country] = sMap;
}
function init() { // script entrypoint
    myUserName = $('.header__profile-name').text().trim();
    const lastBans = localStorage.getItem('#parser_banned');
    const lastQtyBan = localStorage.getItem('#parser_banned_qty');
    const lastQtyBanCl = localStorage.getItem('#parser_banned_qty_c');

    $('.manage__table').before('<div style="padding: 3px;background: #d5d5fd;">Parser:<div style="border: 1px solid #d24141;">  \
        User bans: (через точку с запятой)\
        <textarea style="height: 40px;" rows="2" id="parser_banned"> </textarea> \
        <br>Qty ban: \
        <input id="parser_banned_qty" type="number" value="0"/> \
        <br>Qty ban classic: \
        <input id="parser_banned_qty_c" type="number" value="0"/> \
        <button>Save bans</button> \
        <button id="parser_pause">Pause</button> \
        <button id="parser_resume">Resume</button> \
        </div></div> ');

    if(lastBans) $('#parser_banned').val(lastBans);
    if(lastQtyBan) $('#parser_banned_qty').val(lastQtyBan);
    if(lastQtyBanCl) $('#parser_banned_qty_c').val(lastQtyBanCl);
    $("#parser_pause").click(function() { paused = true; }) // parser pause
    $("#parser_resume").click(function() { paused = false; }) // parser resume
    $("#parser_banned").blur(function() { // save banned users input value
        localStorage.setItem('#parser_banned',$('#parser_banned').val());
    })
    $("#parser_banned_qty").on('blur change',function() { // ban price limit wow main
        localStorage.setItem('#parser_banned_qty',$('#parser_banned_qty').val());
    })
    $("#parser_banned_qty_c").on('blur change',function() { // ban price limit wow classic
        localStorage.setItem('#parser_banned_qty_c',$('#parser_banned_qty_c').val());
    })
    getDoc("https://www.g2g.com/"+(isClassic()?(isEu?EU_GOLD_CL:US_GOLD_CL):(isEu?EU_GOLD:US_GOLD)),function(data) {
      extractServers(isEu?'EU':'US',data);
      prepareListing();
    })
}

init();


/*
https://www.g2g.com/userBar/orderNotification?_=1549912809365


<div class="header__notifications  js-drop-holder">
                                                        <a href="https://chat.g2g.com/chat" target="g2gcw">
          <svg class="icon-chat-beta">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#chat-beta"></use>
          </svg>
        </a>
        &nbsp;
        <a href="https://www.g2g.com/userBar/chat" target="g2gcw" class="header__chat-link">
          <svg class="icon-bell">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#comment"></use>
          </svg>
        </a>
                  &nbsp;&nbsp;&nbsp;
            <a href="#" class="header__notifications-link js-open-link active" onclick="js:g2g.notification.loadNotification();">
              <svg class="icon-bell">
              <use xlink:href="#bell"></use>
              </svg>
            </a>
            <ul id="order-notification" class="notifications__list dropdown-list js-drop">
                <li class="notifications__list-item-title">
    Purchased Orders    <span class="notifications__all">
      <a href="https://www.g2g.com/order/buyOrder/index">View All</a>
    </span>
  </li>
        <li class="notifications__list-item-loading">
        <div id="loadFacebookG">
          <div id="blockG_1" class="facebook_blockG"></div>
          <div id="blockG_2" class="facebook_blockG"></div>
          <div id="blockG_3" class="facebook_blockG"></div>
        </div>
      </li>
        <li class="notifications__list-item-title">
    Sold Orders    <span class="notifications__all">
      <a href="https://www.g2g.com/order/sellOrder/index">View All</a>
    </span>
  </li>
        <li class="notifications__list-item-loading">
        <div id="loadFacebookG">
          <div id="blockG_1" class="facebook_blockG"></div>
          <div id="blockG_2" class="facebook_blockG"></div>
          <div id="blockG_3" class="facebook_blockG"></div>
        </div>
      </li>
                   </ul>
          </div>


*/
