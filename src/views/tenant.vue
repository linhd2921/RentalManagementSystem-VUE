<template>
	<div class="tenantpage">
		<div class="tenantHeader">
			<el-input v-model="keyword" placeholder="根据租客名称查询" class="keyword" @change="searchTenant()"></el-input>
			<div>
				<el-button type="primary" @click="openAddTenant()">新增</el-button>
				<el-button type="danger" @click="delTenant()">删除</el-button>
			</div>
		</div>
		<div class="tenanttable">
			<el-table :data="searchTenant()" border stripe style="width: 100%" height="720" ref="tenantTable" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column type="index" width="55"></el-table-column>
				<el-table-column prop="tenant_name" label="租客姓名"></el-table-column>
				<el-table-column prop="tenant_phone" label="租客手机号码"> </el-table-column>
				<el-table-column prop="tenant_sfznum" label="租客身份证号码"></el-table-column>
				<el-table-column label="租客性别">
					<template slot-scope="scope">
						{{scope.row.sex==1 ? "男" : "女"}}
					</template>
				</el-table-column>
				<el-table-column label="操作" width="90px">
					<template slot-scope="scope">
						<el-button style="background-color: rgb(13,224,243); color: #FFFFFF;" @click="openUpdTenant(scope.row)">修改</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
			 :page-sizes="[10, 20, 30, 40]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="searchTenant().length">
			</el-pagination>
		</div>

		<el-dialog title="新增租客信息" :visible.sync="dialogAddTenant" width="25%" :before-close="handleClose" :show-close="showClose">
			<el-form :model="tenantForm" status-icon :rules="rules" label-width="100px" ref="addtenantForm">
				<el-form-item label="姓名" prop="tenant_name">
					<el-input type="text" v-model="tenantForm.tenant_name" autocomplete="off" placeholder="请输入租客姓名"></el-input>
				</el-form-item>
				<el-form-item label="手机号" prop="tenant_phone">
					<el-input type="text" v-model="tenantForm.tenant_phone" autocomplete="off" placeholder="请输入租客手机号"></el-input>
				</el-form-item>
				<el-form-item label="身份证号码">
					<el-input type="text" v-model="tenantForm.tenant_sfznum" autocomplete="off" placeholder="请输入身份证号码"></el-input>
				</el-form-item>
				<el-form-item label="性别" prop="sex">
					<el-radio v-model="tenantForm.sex" label="1">男</el-radio>
					<el-radio v-model="tenantForm.sex" label="0">女</el-radio>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancleDialog('addtenantForm')">取 消</el-button>
				<el-button type="primary" @click="addTenant('addtenantForm')">确 定</el-button>
			</div>
		</el-dialog>

		<el-dialog title="修改租客信息" :visible.sync="dialogUpdTenant" width="25%" :before-close="handleClose" :show-close="showClose">
			<el-form :model="tenantForm" status-icon :rules="rules" label-width="100px" ref="updtenantForm">
				<el-form-item label="姓名" prop="tenant_name">
					<el-input type="text" v-model="tenantForm.tenant_name" autocomplete="off" placeholder="请输入租客姓名"></el-input>
				</el-form-item>
				<el-form-item label="手机号" prop="tenant_phone">
					<el-input type="text" v-model="tenantForm.tenant_phone" autocomplete="off" placeholder="请输入租客手机号"></el-input>
				</el-form-item>
				<el-form-item label="身份证号码">
					<el-input type="text" v-model="tenantForm.tenant_sfznum" autocomplete="off" placeholder="请输入身份证号码"></el-input>
				</el-form-item>
				<el-form-item label="性别" prop="sex">
					<el-radio v-model="tenantForm.sex" label="1">男</el-radio>
					<el-radio v-model="tenantForm.sex" label="0">女</el-radio>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancleDialog('updtenantForm')">取 消</el-button>
				<el-button type="primary" @click="updTenant('updtenantForm')">确 定</el-button>
			</div>
		</el-dialog>

	</div>
</template>

<script>
	export default {
		name: 'tenant',
		data() {
			//租客姓名判断规则
			var validateTenantname = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请输入租客姓名'));
				} else {
					callback();
				}
			};
			//租客手机判断规则
			var validatePhoneNumber = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请输入手机号码'));
				} else if (!(/^1[3456789]\d{9}$/.test(value))) {
					callback(new Error('手机号有误'));
				}
				callback();
			};
			//租客性别填写判断规则
			var validateSex = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('请选择性别'));
				}
				callback();
			};
			return {
				keyword: "",
				tenantTableData: [],
				dialogAddTenant: false,
				dialogUpdTenant: false,
				tenantForm: {
					id: "",
					tenant_name: "",
					tenant_phone: "",
					tenant_sfznum: "",
					sex: ""
				},
				showClose: false,
				rules: {
					tenant_name: [{
						validator: validateTenantname,
						trigger: 'blur',
						required: true
					}],
					tenant_phone: [{
						validator: validatePhoneNumber,
						trigger: 'blur',
						required: true
					}],
					sex: [{
						validator: validateSex,
						trigger: 'blur',
						required: true
					}]
				},
				//存储勾选信息
				tenantTableSelection: [],
				pagesize: 10,
				page: 1,
			}
		},
		methods: {
			//从后台请求取得用户数据
			getTenantData() {
				let thisapp = this;
				this.$axios({
					methods: 'post',
					url: 'tenant/findTenantAll',
				}).then(response => {
					thisapp.tenantTableData = response.data;
				})
			},
			//根据搜索框关键字查询用户
			searchTenant() {
				let len = this.tenantTableData.length;
				let tenantTableData2 = [];

				let maxindex = this.page * this.pagesize;
				let minindex = (this.page - 1) * this.pagesize;
				if (maxindex > len) {
					maxindex = len;
				}
				for (let i = minindex; i < maxindex; i++) {
					if (this.keyword == "" || this.tenantTableData[i].tenant_name.indexOf(this.keyword) != '-1') {
						tenantTableData2.push(this.tenantTableData[i])
					}
				}
				return tenantTableData2;
			},
			//点击遮罩层什么都不做，不让dialog消失
			handleClose(done) {},
			//新增窗口取消按钮
			cancleDialog(refForm) {
				this.dialogAddTenant = false;
				this.dialogUpdTenant = false;
				//重制样式
				this.$refs[refForm].resetFields();
			},
			openAddTenant() {
				for (let key in this.tenantForm) {
					//重制表单数据
					this.tenantForm[key] = "";
				}
				this.dialogAddTenant = true;
			},
			//新增窗口确定按钮
			addTenant(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("tenant/addTenant", {
							tenant_name: this.tenantForm.tenant_name,
							tenant_phone: this.tenantForm.tenant_phone,
							tenant_sfznum: this.tenantForm.tenant_sfznum,
							sex: this.tenantForm.sex
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getTenantData();
								this.$message.success("租客信息新增成功！");
							} else {
								this.$message.error("租客信息新增失败，请联系管理员");
							}
						})
					} else {
						return false;
					}
				});
			},
			//修改按钮,弹出修改dialog
			openUpdTenant(val) {
				this.dialogUpdTenant = true;
				//数据填充表单
				this.tenantForm.id = val.id;
				this.tenantForm.tenant_name = val.tenant_name;
				this.tenantForm.tenant_phone = val.tenant_phone;
				this.tenantForm.tenant_sfznum = val.tenant_sfznum;
				this.tenantForm.sex = val.sex
			},
			//表格多选框控制
			handleSelectionChange(val) {
				this.tenantTableSelection = val;
			},
			//修改窗口确定按钮
			updTenant(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("tenant/updTenant", {
							id: this.tenantForm.id,
							tenant_name: this.tenantForm.tenant_name,
							tenant_phone: this.tenantForm.tenant_phone,
							tenant_sfznum: this.tenantForm.tenant_sfznum,
							sex: this.tenantForm.sex,
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getTenantData();
								this.$message.success("用户修改成功！");
							} else {
								this.$message.error("用户修改失败，请联系管理员");
							}
						});
					} else {
						return false;
					}
				});
			},
			delTenant() {
				if (this.tenantTableSelection.length == 0) {
					this.$message.error("请选择需要删除的1条数据");
				} else {
					this.$confirm('此操作将永久删除所选择的数据, 是否继续?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						let ids = [];
						for (let key in this.tenantTableSelection) {
							ids.push(this.tenantTableSelection[key].id)
						}
						this.$axios.post("tenant/delTenant", {
								ids: ids
							})
							.then(response => {
								if (response.data > 0) {
									this.$message.success("删除成功");
									this.getTenantData();
								} else if (response.data = -1) {
									this.$message.error("所选租客仍在租房，请在出租管理中将该用户移除");
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
			//分页切换选择展示多少条时回调用的方法
			handleSizeChange(val) {
				console.log(`每页 ${val} 条`);
				this.pagesize = val;
			},
			//切换到第几页时调用的方法
			handleCurrentChange(val) {
				console.log(`当前页: ${val}`);
				this.page = val;
			}
		},
		created() {
			this.getTenantData()
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
	.tenantpage {
		height: 857px;
	}

	.tenantHeader {
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

	.tenanttable {
		padding-left: 20px;
		padding-right: 20px;
	}

	.el-pagination {
		margin-top: 15px;
		float: right;
	}
</style>
