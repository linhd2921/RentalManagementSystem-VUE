import Vue from 'vue'
import VueRouter from 'vue-router'
//这个是同步方式，就是一开始就直接加载
// import Home from '../views/Home.vue'
//() => import(/* webpackChunkName: "about" */ '../views/About.vue')这种是异步方式，请求到的时候才加载
Vue.use(VueRouter)

const routes = [
	{
	  path: '/',
	  component: () => import('../views/login.vue')
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('../views/login.vue')
	},
	{
		path: '/index',
		name: 'index',
		component: () => import('../views/index.vue'),
		redirect:"../home",
		children:[
			{
				path:"/home",
				name:'home',
				component: () => import('../views/home.vue'),
			},
			{
				path:"/user",
				name:'user',
				component: () => import('../views/user.vue'),
			},
			{
				path:"/tenant",
				name:'tenant',
				component: () => import('../views/tenant.vue'),
			},
			{
				path:"/house",
				name:'house',
				component: () => import('../views/house.vue'),
			}
		]
	},
  {
    path: '*',
    name: 'NotFound',
    component: () => import('../views/404.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/demo',
  routes
})

//路由守卫
router.beforeEach((to,from,next) =>{
	const isLogin = localStorage.linhdToken ? true : false;
	if(to.path == "/login"){
		next();
	}else{
		isLogin ? next() : next("/login");
	}
})

export default router
