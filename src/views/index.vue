<template>
	<div>
		<el-row>
			<el-col :md="24" class="indexHeader">
				<el-col :md="2" class="logoimg"><img src="../assets/logo.png" alt=""></el-col>
				<el-col :md="8" class="hidden-sm-and-down">
					<h1>房东管理系统</h1>
				</el-col>
				<el-col :md="3" class="user">
					<div class="name">
						<p class="wel">欢迎</p>
						<p class="username">{{this.$store.state.username}}</p>
					</div>
					<div class="useroption">
						<el-dropdown trigger="click" @command="setDialogInfo">
							<span class="el-dropdown-link">
								<i class="el-icon-s-custom el-icon--right"></i>
							</span>
							<el-dropdown-menu slot="dropdown">
								<!-- <el-dropdown-item command="info">个人信息</el-dropdown-item> -->
								<el-dropdown-item command="logout">退出</el-dropdown-item>
							</el-dropdown-menu>
						</el-dropdown>
					</div>
				</el-col>
			</el-col>
		</el-row>
		<el-row>
			<el-col :md="3" class="asideNav">
				<!-- 菜单树 -->
				<el-col>
					<el-menu :default-active="defaultActive" class="el-menu-vertical-demo" background-color="rgb(50,50,50)" text-color="#fff"
					 active-text-color="#ffd04b" :router="true">
						<el-menu-item index="home">
							<i class="el-icon-s-home"></i>
							<span slot="title">首页</span>
						</el-menu-item>
						<el-menu-item index="tenant">
							<i class="el-icon-s-custom"></i>
							<span slot="title">租客信息管理</span>
						</el-menu-item>
						<el-menu-item index="house">
							<i class="el-icon-house"></i>
							<span slot="title">出租管理</span>
						</el-menu-item>
						<el-menu-item index="user">
							<i class="el-icon-user"></i>
							<span slot="title">登录用户管理</span>
						</el-menu-item>
					</el-menu>
				</el-col>
			</el-col>
			<el-col :md="21">
				<!-- 主内容 -->
				<router-view></router-view>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	export default {

		data() {
			return {
				defaultActive: "",
			}
		},
		methods: {
			setDialogInfo(cmditem) {
				console.log(cmditem);
				switch (cmditem) {
					case "info":
						this.showInfoList();
						break;
					case "logout":
						this.logout();
						break;
					default:
						break;
				}
			},
			showInfoList() {
				console.log('个人信息!');
			},
			logout() {
				console.log('退出');
				//清除token
				localStorage.removeItem("linhdToken");
				//设置vuex store
				this.$store.state.username = "";
				//跳转到login页面
				this.$router.push("/login");
			},
		},
		created() {
			this.defaultActive = window.location.pathname.split("/").pop();
		}
	}
</script>

<style scoped>
	.indexHeader {
		height: 80px;
		background: rgb(50, 50, 50, 1);
	}

	.logoimg {
		height: 100%;
		padding-left: 20px;
	}

	.logoimg img {
		height: 100%;
	}

	h1 {
		font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
		line-height: 80px;
		margin: 0;
		color: #fff;
		letter-spacing: 12px;
	}

	.user {
		float: right;
	}

	.name {
		color: #FFFFFF;
		text-align: center;
		position: absolute;
		width: 50px;
		line-height: 25px;
		top: 20%;
		right: 50px;
	}

	.name p {
		margin: 0;
		font-weight: 600;
	}

	.username {
		color: rgb(65, 184, 131);
	}

	.useroption {
		cursor: pointer;
		color: #FFFFFF;
		position: absolute;
		right: 20px;
		line-height: 80px;
	}

	.el-dropdown {
		color: #fff;
	}

	.asideNav {
		background-color: rgb(50, 50, 50);
		height: 857px;
		overflow: auto
	}

	.el-menu {
		border: 0;
	}
</style>
