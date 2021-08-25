// 构造函数，可以通过它new一个面板实例出来
function Panel() {
  //实例化panel时，调用create函数（作用：在页面上挂载面板的div元素）
  this.create()
  //调用bind函数（绑定转换面板上关闭按钮的点击事件）
  this.bind()
}
//在Panel的原型链上创建一个create方法(作用:生成一个div元素,innerHTML是翻译面板的HTML内容)
Panel.prototype.create = function () {
  //创建一个div元素,变量名叫container
  let container = document.createElement('div')
  container.id= 'translate-panel'
  /*转换面板的HTML内容 里面class为content的标签内的内容没有写,因为这里面的内容需要后面动态生成后插入,简体中文那里的content写了三个点是
  是因为那里的转换后的内容是异步获取的,在真正获取到内容前,把内容都显示成...做一个过渡*/
  let html =`<div class="header"><span class="title">汇率1</span><span id="tp-close" class="tp-close">x</span></div>`
  container.innerHTML = html
  container.classList.add('translate-panel')
  document.body.appendChild(container)
  //把这个container当成一个属性赋值给Panel构造函数,方便后续对这个翻译面板进行其他操作,如替换面板中的内容
  this.container = container
  // this.close = container.querySelector('.close')
  this.close = container.querySelector('.header .tp-close');
  //用来显示需要查询的内容
  this.source = container.querySelector('.source .content')
  //用来显示翻译后的内容
  // this.dest = container.querySelector('.dest .content')
  container.addEventListener("mousedown",function(event){
    abc=event||window.event
    abc.stopPropagation()
  })
}
//显示翻译面板
Panel.prototype.show = function () {
  //container默认没有show这个class,默认样式是opacity:0;css中,如果container同时拥有show class,则opacity:1 取消隐藏
  this.container.classList.remove('hide')
  this.container.classList.add('show')
}
//隐藏翻译面板
Panel.prototype.hide = function () {
  this.container.innerHTML='';
  this.container.classList.remove('show')
  this.container.classList.add('hide')
}
//Panel函数绑定的事件. 
Panel.prototype.bind = function () {
  //关闭按钮发生点击事件
  this.close.onclick = (event) => {
      this.hide() //把翻译面板隐藏起来
  }
}
// 添加一个币种 cell
Panel.prototype.addCell = function (currentCurrency,amount){
  let containerCell = document.createElement('div');
  containerCell.id= 'div-'+currentCurrency.name;
  let cCode = currentCurrency.code.toUpperCase();
  const decValue = Number(lStorageObject.displayDecimal);
  console.log('decValue',decValue);
  let cAmount = (amount*100/100).toFixed(decValue);
  let flag =`../images/flags/${currentCurrency.flag}.svg`; 
  let flagUrl= chrome.extension.getURL(flag);
  let cellHtml =` 
    <div class="cell">
      <div class="left">
      <img src="${flagUrl}">
      <div class="name">
        <span>${cCode}</span>
        <span class="exchange">1${lStorageObject.currencyList[0].code}=${currentCurrency.rate}${currentCurrency.code}</span>
        </div>
      </div>
      <div class="right">
        <span class="money">${cAmount}</span>
        <span class="unit">${currentCurrency.name}${currentCurrency.symbol}</span>
      </div>
    </div>`;
  this.container.innerHTML += cellHtml;
}
//重置面板内容
Panel.prototype.reset = async function () {
  let html2 =``
  this.container.innerHTML=html2;   
}
//翻译功能函数 (参数raw的含义:用户选中的文本内容)
Panel.prototype.calc = async function (currencyType,amount) {
  const rate = await getRateList();
    const cList=lStorageObject.currencyList || currencies;
    for(const current of cList){
      current.rate = rate[current.code];
      if(!current.isCheck) continue;
      let currentAmount = amount * current.rate;
      const decValue = Number(lStorageObject.displayDecimal);
      currentAmount =currentAmount.toFixed(decValue);
      panel.addCell(current,currentAmount)
    }
    chrome.runtime.sendMessage({'setLocalStorage':cList}, function(response) {});
}

//面板在网页中显示的位置 传入的参数是一个pos对象,其中包含x,y
Panel.prototype.pos = function (pos) {
  this.container.style.top = (pos.y+5) + 'px'
  this.container.style.left = pos.x + 'px'
}
let lStorageObject=true;
//发给 background 索取 localStorage
chrome.runtime.sendMessage('getLocalStorage', function(response) {
  lStorageObject=response;
 });
//监听 popup 发来的实时修改后的localStorage
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  if(request)lStorageObject=request;
});
//实例化一个面板
let panel = new Panel()
//监听鼠标的释放事件
window.onmouseup = function (e) {

  let raw = window.getSelection().toString().trim() //获取选中的内容
  //获取释放鼠标时，光标位置
  let x = e.pageX
  let y = e.pageY
  //只有被选中的是数字并且开关开启，才进行显示
  let onOff= lStorageObject.onOff ;
  console.log('onOff',onOff);
  if (~~raw && ~~onOff) {
      //设置面板的显示位置
      panel.pos({x: x, y: y})
      panel.reset();
      panel.calc('CNY',raw);
      //  panel.bind();
      //添加相应内容
      //显示面板
      panel.show()
  }
}
//点击页面上其他地方(面板外）隐藏面板
window.onmousedown = function (e) {
  panel.hide()
 
}