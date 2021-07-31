function getUseCurrencyList() {
  return localStorage.getItem("selectedList");
}
function setUseCurrencyList(list) {
  localStorage.setItem("selectedList", list);
}

//获取 上次保存的汇率列表
function getRateFromStorage(date) {
  let result='';
  let storageData = localStorage.getItem("rate");
  if( storageData && storageData.date === date){
    result= storageData.rate;
  }
  return result;
}
//设置 汇率列表
function setRateToStorage(dateStr) {
  localStorage.setItem("rate", dateStr);
}

//获取当期日期
function getCurrentDate(){   
  var date = new Date(); //创建时间对象  
  var year = date.getFullYear(); //获取年   
  var month = date.getMonth()+1;//获取月
  if(month<10) month='0'+month;
  var day = date.getDate(); //获取当日  
  var time = year+"-"+month+"-"+day; //组合时间  
  return time;
}

//获取汇率列表
async function getRateList(){
  return new Promise((resolve, reject) => {
      //获取上次缓存的时间
      const savedRateDate =  getRateFromStorage(getCurrentDate());
      if(savedRateDate){
        return resolve(rateList);
      }
      else{
        let qCode ='USD';
        const cList = lStorageObject.currencyList;
        qCode =  cList && cList[0].code;
        const url = `https://api.exchangerate-api.com/v4/latest/${qCode}`
        fetch(url)
        .then(res => res.json()) 
        .then(res => {
          setRateToStorage({date:res.date,rate:res.rates});
          resolve(res.rates);
        });
      }
  });   
}
//获取小数位数
function getDisplayDecimal(){
  return localStorage.getItem("displayDecimal");
}