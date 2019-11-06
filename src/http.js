import axios from "axios";
import {Message,Loading} from "element-ui";
import router from "./router/index.js";

const BASE_URL = "http://localhost:9999/"
let loading;
let onMessage = true;

//开始加载动画
function startLoading(){
	loading = Loading.service({
		lock:true,
		text:"拼命加载中...",
		background:'rgba(0,0,0,0.7)'
	})
}
//结束加载动画
function endLoading(){
	loading.close();
}

//请求拦截
axios.interceptors.request.use(config =>{
	config.url = BASE_URL + config.url;
	//加载动画
	startLoading();
	
	if(localStorage.linhdToken){
		//设置统一的请求头header
		config.headers.linhdToken = localStorage.linhdToken;
	}
	return config;
},error =>{
	return Promise.reject(error);
})

//响应拦截
axios.interceptors.response.use(response =>{
	//结束加载动画
	endLoading();
	return response;
},error =>{
	endLoading();
	//获取错误状态码
	const { status } = error.response;
	if(status == 401){
		if(onMessage){
			Message.error("身份信息失效，请重新登录");
			onMessage = false;
		}
		//清除token,跳转到登录页面
		localStorage.removeItem("linhdToken");
		router.push('/login');
	}else{
		Message.error("数据提交/获取失败，请联系管理员，错误代码："+status);
	}
	return Promise.reject(error);
})

export default axios;