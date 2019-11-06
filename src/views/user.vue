<template>
	<div class="userpage">
		<div class="userHeader">
			<el-input v-model="keyword" placeholder="根据用户名查询" class="keyword" @change="searchUser()"></el-input>
			<el-button type="primary" @click="openAddUser()">新增用户</el-button>
		</div>
		<div class="usertable">
			<el-table :data="searchUser()" border stripe style="width: 100%" ref="userTable" height="720">
				<el-table-column type="index" width="55"></el-table-column>
				<el-table-column prop="username" label="用户名"></el-table-column>
				<el-table-column prop="password" label="密码"></el-table-column>
				<el-table-column prop="createdate" label="用户新增日期"></el-table-column>
				<el-table-column prop="changedate" label="用户修改日期"></el-table-column>
				<el-table-column label="操作" width="171px">
					<template slot-scope="scope">
						<el-button style="background-color: rgb(13,224,243); color: #FFFFFF;" @click="openUpdUser(scope.row)">修改</el-button>
						<el-button type="danger" @click="delUser(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>

		<el-dialog title="新增用户" :visible.sync="dialogAddUser" width="25%" :before-close="handleClose" :show-close="showClose">
			<el-form :model="userForm" status-icon :rules="rulesAdd" label-width="100px" ref="addUserForm">
				<el-form-item label="用户名" prop="username">
					<el-input type="text" v-model="userForm.username" autocomplete="off" placeholder="请输入用户名"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input type="password" v-model="userForm.password" autocomplete="off" placeholder="请输入密码"></el-input>
				</el-form-item>
				<el-form-item label="确认密码" prop="password2">
					<el-input type="password" v-model="userForm.password2" autocomplete="off" placeholder="请确认密码"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancleDialog('addUserForm')">取 消</el-button>
				<el-button type="primary" @click="addUser('addUserForm')">确 定</el-button>
			</div>
		</el-dialog>

		<el-dialog title="修改用户" :visible.sync="dialogUpdUser" width="25%" :before-close="handleClose" :show-close="showClose">
			<el-form :model="userForm" status-icon :rules="rulesUpd" label-width="100px" ref="updUserForm">
				<el-form-item label="用户名" prop="username">
					<el-input type="text" v-model="userForm.username" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="原始密码" prop="password">
					<el-input type="password" v-model="userForm.password" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="新密码" prop="password">
					<el-input type="password" v-model="userForm.password1" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="确认新密码" prop="password2">
					<el-input type="password" v-model="userForm.password2" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancleDialog('updUserForm')">取 消</el-button>
				<el-button type="primary" @click="updUser('updUserForm')">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: 'user',
		data() {
			//新增用户名判断规则
			var validateUsername_add = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请输入用户名'));
				} else {
					//如果非空则去数据库查询是否存在相同的用户名
					this.$axios.post(
						"user/findCountByName", {
							username: value
						}
					).then(response => {
						if (response.data == 0) {
							//则不存在相同用户
							callback();
						} else {
							callback(new Error('已存在相同用户名'));
						}
					})
				}
			};
			var validateUsername_upd = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请输入用户名'));
				} else {
					//如果非空则去数据库查询是否存在相同的用户名
					this.$axios.post(
						"user/findCountByName", {
							username: value,
							id: this.userForm.id
						}
					).then(response => {
						if (response.data == 0) {
							//则不存在相同用户
							callback();
						} else {
							callback(new Error('已存在相同用户名'));
						}
					})
				}
			};
			//密码判断规则
			var validatePassword = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请输入密码'));
				} else {
					callback();
				}
			};
			//确认密码判断规则
			var validatePassword2_add = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请输入确认密码'));
				} else if (this.userForm.password != this.userForm.password2) {
					callback(new Error('两次密码输入不一致'));
				} else {
					callback();
				}
			};
			//确认密码判断规则
			var validatePassword2_upd = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请输入确认密码'));
				} else if (this.userForm.password1 != this.userForm.password2) {
					callback(new Error('两次密码输入不一致'));
				} else {
					callback();
				}
			};
			return {
				keyword: "",
				userTableData: [],
				dialogAddUser: false,
				dialogUpdUser: false,
				userForm: {
					id: "",
					username: "",
					password: "",
					password1: "",
					password2: ""
				},
				showClose: false,
				rulesAdd: {
					username: [{
						validator: validateUsername_add,
						trigger: 'blur',
						required: true
					}],
					password: [{
						validator: validatePassword,
						trigger: 'blur',
						required: true
					}],
					password2: [{
						validator: validatePassword2_add,
						trigger: 'blur',
						required: true
					}]
				},
				rulesUpd: {
					username: [{
						validator: validateUsername_upd,
						trigger: 'blur',
						required: true
					}],
					password: [{
						validator: validatePassword,
						trigger: 'blur',
						required: true
					}],
					password2: [{
						validator: validatePassword2_upd,
						trigger: 'blur',
						required: true
					}]
				}
			}
		},
		methods: {
			//从后台请求取得用户数据
			getUserData() {
				let thisapp = this;
				this.$axios({
					methods: 'post',
					url: 'user/getUserData',
				}).then(response => {
					let len = response.data.length;
					for (let i = 0; i < len; i++) {
						response.data[i].createdate = this.dateFormat(response.data[i].createdate);
						response.data[i].changedate = this.dateFormat(response.data[i].changedate);
					}

					thisapp.userTableData = response.data;
				})
			},
			//日期格式化
			dateFormat(date) {
				let userdate = new Date(date);
				let year = userdate.getFullYear();
				let month = (userdate.getMonth() + 1) > 9 ? userdate.getMonth() + 1 : "0" + userdate.getMonth() + 1;
				let day = (userdate.getDate()) > 9 ? userdate.getDate() : "0" + userdate.getDate();
				let hour = (userdate.getHours()) > 9 ? userdate.getHours() : "0" + userdate.getHours();
				let min = (userdate.getMinutes()) > 9 ? userdate.getMinutes() : "0" + userdate.getMinutes();
				let sec = (userdate.getSeconds()) > 9 ? userdate.getSeconds() : "0" + userdate.getSeconds();
				return `${year}-${month}-${day} ${hour}:${min}:${sec}`;

			},
			//根据搜索框关键字查询用户
			searchUser() {
				let len = this.userTableData.length;
				let userTableData2 = [];
				for (let i = 0; i < len; i++) {
					if (this.keyword == "" || this.userTableData[i].username.indexOf(this.keyword) != '-1') {
						userTableData2.push(this.userTableData[i])
					}
				}
				return userTableData2;
			},
			//点击遮罩层什么都不做，不让dialog消失
			handleClose(done) {},
			//新增窗口取消按钮
			cancleDialog(refForm) {
				this.dialogAddUser = false;
				this.dialogUpdUser = false;
				this.$refs[refForm].resetFields();
			},
			openAddUser() {
				for (let key in this.userForm) {
					this.userForm[key] = "";
				}
				this.dialogAddUser = true;
			},
			//新增窗口确定按钮
			addUser(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("user/addUser", {
							username: this.userForm.username,
							password: this.userForm.password
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getUserData();
								this.$message.success("用户新增成功！");
							} else {
								this.$message.error("用户新增失败，请联系管理员");
							}
						})
					} else {
						return false;
					}
				});
			},
			//修改按钮,弹出修改dialog
			openUpdUser(val) {
				for (let key in this.userForm) {
					this.userForm[key] = "";
				}
				this.dialogUpdUser = true;
				//数据填充表单
				this.userForm.id = val.id;
				this.userForm.username = val.username;
			},
			//修改窗口确定按钮
			updUser(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("user/updUser", {
							id: this.userForm.id,
							username: this.userForm.username,
							password: this.userForm.password,
							password2: this.userForm.password2,
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getUserData();
								this.$message.success("用户修改成功！");
							} else {
								this.$message.error("用户修改失败，原始密码错误");
							}
						}).catch(() => {
							this.$message.error("服务器异常，请联系管理员");
						});
					} else {
						return false;
					}
				});
			},
			delUser(val) {
				this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$axios.post("user/delUser", {
							id: val.id
						})
						.then(response => {
							if (response.data == 1) {
								this.$message.success("删除成功");
								this.getUserData();
							} else {
								this.$message.error("删除失败，联系管理员");
							}
						}).catch(() => {
							this.$message.error("网络不通，请联系管理员");
						});
				}).catch(() => {
					this.$message.info("已取消删除");
				});
			}
		},
		created() {
			this.getUserData()
		}
	}

	function strIsEmpty(obj) {
		if (typeof obj == "undefined" || obj == null || obj == "") {
			return true;
		} else {
			return false;
		}
	}

	function strTrim(str) {
		if (typeof str == "string") {
			return str.replace(/\s+/g, "").replace(/<\/?.+?>/g, "").replace(/[\r\n]/g, "")
		}
		return str;
	}
</script>

<style scoped>
	.userpage {
		height: 857px;
	}

	.userHeader {
		position: relative;
		top: 15px;
		height: 50px;
		border: 1px solid aliceblue;
		line-height: 50px;
		margin-left: 20px;
		margin-right: 20px;
		padding-bottom: 15px;
	}

	.keyword {
		width: 12.5rem;
		padding-left: 1.875rem;
		padding-right: 30px;
		float: left;
	}

	.usertable {
		padding-left: 20px;
		padding-right: 20px;
	}
</style>
