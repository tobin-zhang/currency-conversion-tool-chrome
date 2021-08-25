// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  let result={};
  if(request =='getLocalStorage'){
    result.onOff= 1;
    if(localStorage.getItem("onOff") != null){
     result.onOff=localStorage.getItem("onOff");//开关
    }
    result.displayDecimal = 2
    if(localStorage.getItem("displayDecimal") != null){
      result.displayDecimal = localStorage.getItem("displayDecimal");//显示小数位数
    }
    result.currencyList = JSON.parse(localStorage.getItem("currencyList")) || currencies;//货币列表
  }
  if( request.hasOwnProperty("setLocalStorage")){
    const content = JSON.stringify(request['setLocalStorage']);
    localStorage.setItem("currencyList",content);
  }
  sendResponse(result);
});
