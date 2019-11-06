<template>

	<div>
		<div class="backgroundimg" @keyup.enter="login">
			<el-row class="loginContainer">
				<el-col :md="8" :offset="8" class="logindiv">
					<el-row class="loginrows">
						<img src="../assets/logo.png" />
					</el-row>
					<el-row class="loginrows">
						<el-col :md="10" :offset="7">
							<el-input type="text" placeholder="请输入用户名" v-model="username"></el-input>
						</el-col>
					</el-row>
					<el-row class="loginrows">
						<el-col :md="10" :offset="7">
							<el-input type="password" placeholder="请输入密码" v-model="password" show-password></el-input>
						</el-col>
					</el-row>
					<el-row class="loginrows">
						<el-col :md="10" :offset="7">
							<el-button type="primary" class="loginbtn" @click="login">登录</el-button>
						</el-col>
					</el-row>
				</el-col>
			</el-row>

		</div>
	</div>
</template>

<script>
	export default {
		name: 'login',
		data() {
			return {
				username: "",
				password: ""
			}
		},
		methods: {
			login() {
				if (this.username == "" || this.password == "") {
					this.$message({
						message: "用户名密码不能为空",
						type: 'warning',
						duration: 3000
					});
				} else {
					this.$axios.post("user/login", {
						username: this.username,
						password: this.password
					}).then(response => {
						if (response.data.msg != undefined) {
							this.$message({
								message: response.data.msg,
								type: 'error',
								duration: 3000
							})
						} else {
							//拿到token
							let token = response.data.linhdToken;
							localStorage.setItem("linhdToken", token);
							//username存入vuex中
							this.$store.state.username = response.data.username;
							//登录成功跳转页面
							this.$router.push("/home");
						}
					})
				}
			}
		}

	}
</script>

<style scoped>
	.backgroundimg {
		background: url(../assets/backgroundimg.jpg) no-repeat center 0px;
		background-position: center 0;
		background-size: cover;
		min-height: 100vh;
	}

	.loginbtn {
		width: 100%;
	}

	.loginContainer {
		position: relative;
		top: 200px;
	}

	.logindiv {
		background-color: #ffffff;
		border-radius: 50px;
	}

	.loginrows {
		padding: 10px;
		text-align: center;
	}
</style>
