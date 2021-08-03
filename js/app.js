
Vue.component('vuedraggable', window.vuedraggable)
Vue.component('clipboard', window.clipboard)

 // 在 #app 标签下渲染一个按钮组件
 var data = { 
    checked:true,
    active:0, 
    drag: false,
    onOff:true, //开关
    displayDecimal:2,//小数位数
    currencyList: currencies 
}
 new Vue({
  data: data,
  el: '#app',
  template: `
  <div>
</draggable>
  <van-tabs v-model="active" color="#ff8d29" line-width="50px" >
    <van-tab title="货币转换">
    </van-tab>
    <van-tab title="设置"></van-tab>
  </van-tabs>
  <div  v-show="active===0">
    <draggable v-model="currencyList" chosen-class="chosen" force-fallback="true" group="name"  @start="onStart" @end="onEnd" handle=".handle">
    <transition-group
      <div class="cell" v-for="element in currencyList" :key="element.name">
        <div class="left">
        <van-checkbox v-model="element.isCheck"   icon-size="20px"  checked-color="#ff8d29" ></van-checkbox>
          <img :src="getFlag(element.flag)"/>
          <div class="content">
          <span class="name">{{element.name}}-{{element.code}}</span>
          <span class="exchange" v-if="element.rate">1{{currencyList[0].code}}={{element.rate}}{{element.code}}</span>
          </div>
        </div>
        <div class="right">
          <van-icon name="wap-nav"  size="20" class="handle" color="#999" />
        </div>
      </div>
    </transition-group>
  </div>
  <div  v-show="active===1">
    <van-cell-group style="margin-top:20px">
      <van-cell  icon="exchange" title="划数转换"  value="" > 
        <template #right-icon>
          <van-switch v-model="onOff" size='20' active-color="#ff8d29" inactive-color="#dcdee0"/>
        </template>
      </van-cell>
      <van-cell title="小数位数" icon="more-o" value="" > 
        <template #right-icon>
          <van-stepper v-model='displayDecimal' />
        </template>
      </van-cell>
      <van-cell title="联系作者"  icon="envelop-o" is-link > 
        <template #right-icon>
        <van-button class="copybtn" type="primary" size="mini" @click="createCopy" :data-clipboard-text="' tobin.c.zhang@gmial.com'">点击复制邮箱</van-button>
        </template>
      </van-cell>
    </van-cell-group>
    

  </div>
</div>
`,
  components: {
    vuedraggable: window.vuedraggable,//当前页面注册组件
  },
  mounted() {
    console.log('getOnOff',this.getOnOff());
    this.displayDecimal=Number(this.getDisplayDecimal());
    this.onOff= this.getOnOff();
    this.currencyList =this.getCurrencyList() || this.currencyList;
  },
  methods: {
    setDefault: function (name) {
    },
    onStart() {
      this.drag = true;
    },
    onEnd() {
        this.drag = false;
    },
    //设置小数位数
    setDisplayDecimal(number){
      localStorage.setItem("displayDecimal", number);
    },
    //获取小数位数
    getDisplayDecimal(){
      return localStorage.getItem("displayDecimal");
    },
     //设置划数转换开关
    setOnOff(value){
      localStorage.setItem("onOff", value);
    },
    //获取划数转换开关
    getOnOff(){
      return localStorage.getItem("onOff") || true;
    },
    //设置货币列表
    getCurrencyList(){
      return JSON.parse(localStorage.getItem("currencyList"));
    }, 
    setCurrencyList(list){
      localStorage.setItem("currencyList", JSON.stringify(list));
    },
    gotoReviews(){
     
    },
    //复制邮箱
    createCopy(){
      var clipboard = new ClipboardJS('.copybtn')  //此处为点击的dom的类名
      clipboard.on('success', e => {
          console.log('复制成功')
          // 释放内存
          clipboard.destroy()
      })
      clipboard.on('error', e => {
          // 不支持复制
            console.log('该浏览器不支持自动复制')
          // 释放内存
            clipboard.destroy()
      }) 
    },
    sendToContentScript(){
      let result={};
      result.onOff= localStorage.getItem("onOff");//开关
      result.displayDecimal =localStorage.getItem("displayDecimal");//显示小数位数
      result.currencyList = JSON.parse(localStorage.getItem("currencyList"));//货币列表
      sendMessageToContentScript(result,function(response){});
    },
    getFlag(name){
      let flag =`../images/flags/${name}.svg`; 
      return flag;
    }
  },
  watch:{
    displayDecimal(val){
      this.setDisplayDecimal(val);
      this.sendToContentScript();
    },
    onOff(val){
      this.setOnOff(val);
      this.sendToContentScript();
    },
    currencyList: {
      // 数据变化时执行的逻辑代码
      handler(newName, oldName) {
        this.setCurrencyList((newName));
        this.sendToContentScript();
      },
      // 开启深度监听
      deep: true
  }
  }
});

//向content-script 发送内容
function sendMessageToContentScript(message, callback)
{
  chrome.tabs.query({active:true, currentWindow:true},function(tabs)
  {
    chrome.tabs.sendMessage(tabs[0].id, message,function(response)
    {
      if(callback) callback(response);
      if(chrome.runtime.lastError) {
        console.log('接收端不存在');
      } 
    });
  });
}



