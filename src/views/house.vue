<template>
	<div class="housepage">
		<div class="househeader">
			<el-input v-model="keyword" placeholder="输入你想查的" class="keyword"></el-input>
			<el-button type="primary" @click="openAddHouse()">新增房子</el-button>
		</div>
		<div class="housebody">
			<el-table :data="searchHouse()" border stripe style="width: 100%" height="720" ref="houseTable">
				<el-table-column type="index" width="55px"></el-table-column>
				<el-table-column label="房子信息" width="250px">
					<template slot-scope="scope">
						<el-tooltip class="item" effect="dark" content="点击修改房子信息" placement="top-start" :enterable="false">
							<el-card shadow="hover" :body-style="isHouseEmpty(scope.row)">
								<div @click.prevent="openUpdHouse(scope.row)">
									<div class="house_region">{{scope.row.house_region}}</div>
									<div class="house_address">{{scope.row.house_address}}</div>
								</div>
							</el-card>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column label="房间信息">
					<template slot-scope="scope">
						<el-col :md="2" v-for="(room, index) in scope.row.rooms == null ? '' : scope.row.rooms" :key="index" class="roomscard">
							<el-tooltip class="item" effect="dark" content="点击修改房间信息" placement="top-start" :enterable="false">
								<el-card shadow="hover" :body-style="roomType(room)">
									<div @click.prevent="openUpdRoom(room)">
										<div class="room_num">{{room.room_number}}:{{room.room_price}}</div>
										<div class="room_tenant_name">{{room.tenant == null ? "" : room.tenant.tenant_name}}</div>
									</div>
								</el-card>
							</el-tooltip>
						</el-col>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="119px">
					<template slot-scope="scope">
						<el-tooltip class="item" effect="dark" content="增加房间" placement="top-start" :enterable="false">
							<el-button class="el-icon-plus" type="primary" @click.prevent="openAddRoom(scope.row)" size="mini"></el-button>
						</el-tooltip>
						<el-tooltip class="item" effect="dark" content="删除房子" placement="top-start" :enterable="false">
							<el-button class="el-icon-delete" type="danger" @click.prevent="delHouse(scope.row)" size="mini"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page"
			 :page-sizes="[10, 20, 30, 40]" :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="searchHouse().length">
			</el-pagination>
		</div>

		<el-dialog title="新增房子信息" :visible.sync="dialogAddHouse" width="25%" :before-close="handleClose" :showClose="showClose">
			<el-form :model="houseInfo" status-icon :rules="rules" label-width="100px" ref="addhouseInfoFrom">
				<el-form-item label="所在小区" prop="house_region">
					<el-input type="text" v-model="houseInfo.house_region" autocomplete="off" placeholder="请输入小区名称"></el-input>
				</el-form-item>
				<el-form-item label="详细住址" prop="house_address">
					<el-input type="text" v-model="houseInfo.house_address" autocomplete="off" placeholder="请输入详细住址"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancleDialog('addhouseInfoFrom')">取 消</el-button>
				<el-button type="primary" @click="addHouse('addhouseInfoFrom')">确 定</el-button>
			</div>
		</el-dialog>

		<el-dialog title="修改房子信息" :visible.sync="dialogUpdHouse" width="25%" :before-close="handleClose" :showClose="showClose">
			<el-form :model="houseInfo" status-icon :rules="rules" label-width="100px" ref="updhouseInfoFrom">
				<el-form-item label="所在小区" prop="house_region">
					<el-input type="text" v-model="houseInfo.house_region" autocomplete="off" placeholder="请输入小区名称"></el-input>
				</el-form-item>
				<el-form-item label="详细住址" prop="house_address">
					<el-input type="text" v-model="houseInfo.house_address" autocomplete="off" placeholder="请输入详细住址"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancleDialog('updhouseInfoFrom')">取 消</el-button>
				<el-button type="primary" @click="updHouse('updhouseInfoFrom')">确 定</el-button>
			</div>
		</el-dialog>

		<el-dialog title="新增房间信息" :visible.sync="dialogAddRoom" width="25%" :before-close="handleClose" :showClose="showClose">
			<el-form :model="roomInfo" status-icon :rules="rules" label-width="100px" ref="addroomInfoFrom">
				<el-form-item label="房间标号" prop="room_number">
					<el-input type="text" v-model="roomInfo.room_number" autocomplete="off" placeholder="请输入房间标号"></el-input>
				</el-form-item>
				<el-form-item label="房间租金" prop="room_price">
					<el-input type="text" v-model="roomInfo.room_price" autocomplete="off" placeholder="请输入房间租金"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancleDialog('addroomInfoFrom')">取 消</el-button>
				<el-button type="primary" @click="addRoom('addroomInfoFrom')">确 定</el-button>
			</div>
		</el-dialog>

		<el-dialog title="修改房间信息" :visible.sync="dialogUpdRoom" width="25%" :before-close="handleClose" :showClose="showClose">
			<el-form :model="roomInfo" status-icon :rules="rules" label-width="100px" ref="updroomInfoFrom">
				<el-form-item label="房间标号" prop="room_number">
					<el-input type="text" v-model="roomInfo.room_number" autocomplete="off" placeholder="请输入房间标号"></el-input>
				</el-form-item>
				<el-form-item label="房间租金" prop="room_price">
					<el-input type="text" v-model="roomInfo.room_price" autocomplete="off" placeholder="请输入房间租金"></el-input>
				</el-form-item>
				<el-form-item v-show="dialogUpdRoom" label="租房客户">
					<el-select v-model="roomInfo.room_tenant_id" filterable clearable placeholder="请选择租房客户">
						<el-option v-for="item in tenantOptions" :key="item.id" :label="item.tenant_name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-show="dialogUpdRoom" label="出租日期" prop="rental_date">
					<el-date-picker v-model="roomInfo.rental_date" type="date" placeholder="选择出租日期" @change="changeCollectionDate(roomInfo.rental_date)"></el-date-picker>
				</el-form-item>
				<el-form-item v-show="dialogUpdRoom" label="收租日期" prop="rent_collection_date">
					<el-date-picker v-model="roomInfo.rent_collection_date" type="date" placeholder="选择收租日期"></el-date-picker>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="delRoom('updroomInfoFrom')" type="danger">删除房间</el-button>
				<el-button @click="cancleDialog('updroomInfoFrom')">取 消</el-button>
				<el-button type="primary" @click="updRoom('updroomInfoFrom')">确 定</el-button>
			</div>
		</el-dialog>

	</div>
</template>

<script>
	export default {
		name: 'house',
		data() {
			//信息不能为空判断
			var validateNotEmpty = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('此处不能为空'));
				}
				callback();
			};
			//金额判断
			var validatePrice = (rule, value, callback) => {
				if (strIsEmpty(strTrim(value))) {
					callback(new Error('此处不能为空'));
				} else if (!/^[0-9]*$/.test(value)) {
					callback(new Error('金额必须为整数'));
				}
				callback();
			};
			//时间判断
			var validateDate = (rule, value, callback) => {
				if (strIsEmpty(strTrim(this.roomInfo.room_tenant_id)) && !strIsEmpty(strTrim(value))) {
					callback(new Error('请先选择租客再选日期'));
				} else if (!strIsEmpty(strTrim(this.roomInfo.room_tenant_id)) && strIsEmpty(strTrim(value))) {
					callback(new Error('请选择日期'));
				}
				if (Date.parse(this.roomInfo.rental_date) > Date.parse(this.roomInfo.rent_collection_date)) {
					callback("收租日期不能早于出租日期");
				}
				callback();
			};
			return {
				keyword: "",
				rooms: [],
				houses: [],
				dialogUpdHouse: false,
				dialogAddHouse: false,
				dialogAddRoom: false,
				dialogUpdRoom: false,
				houseInfo: {
					id: "",
					house_region: "",
					house_address: ""
				},
				roomInfo: {
					room_house_id: "", //所属房子id
					room_number: "", //房间标号
					room_price: "", //租金
					room_tenant_id: "", //租房人id
					room_tenant_name: "",
					rental_date: "", //入住日期
					rent_collection_date: "" //收租日期
				},
				showClose: false,
				rules: {
					house_region: [{
						validator: validateNotEmpty,
						trigger: 'blur',
						required: true
					}],
					house_address: [{
						validator: validateNotEmpty,
						trigger: 'blur',
						required: true
					}],
					room_number: [{
						validator: validateNotEmpty,
						trigger: 'blur',
						required: true
					}],
					room_price: [{
						validator: validatePrice,
						trigger: 'blur',
						required: true
					}],
					rental_date: [{
						validator: validateDate,
						trigger: 'blur'
					}],
					rent_collection_date: [{
						validator: validateDate,
						trigger: 'blur'
					}],
				},
				tenantOptions: [],
				pagesize: 10,
				page: 1,
			}
		},
		methods: {
			getHouseData() {
				this.$axios.get("house/findHouse", "").then(response => {
					this.houses = response.data;
				})
			},
			//根据关键字搜索写得难受。
			searchHouse() {
				let len = this.houses.length;
				let maxindex = this.page * this.pagesize;
				let minindex = (this.page - 1) * this.pagesize;
				if (maxindex > len) {
					maxindex = len;
				}
				let houses2 = [];
				for (let i = minindex; i < maxindex; i++) {
					if (strIsEmpty(this.houses[i].rooms)) {
						if (this.keyword == "" || this.houses[i].house_region.indexOf(this.keyword) != '-1') {
							houses2.push(this.houses[i])
						}
					} else {
						let roomsLen = this.houses[i].rooms.length;
						let A = false;
						for (let j = 0; j < roomsLen; j++) {
							if (strIsEmpty(this.houses[i].rooms[j])) {
								if (A) {
									continue;
								}
								if (this.keyword == "" || this.houses[i].house_region.indexOf(this.keyword) != '-1') {
									houses2.push(this.houses[i]);
									A = true;
									break;
								}
							} else {
								if (A) {
									continue;
								}
								if (strIsEmpty(this.houses[i].rooms[j].tenant)) {
									if (this.keyword == "" || this.houses[i].house_region.indexOf(this.keyword) != '-1') {
										houses2.push(this.houses[i]);
										A = true;
										break;
									}
								} else {
									if (this.keyword == "" || this.houses[i].house_region.indexOf(this.keyword) != '-1' ||
										this.houses[i].rooms[j].tenant.tenant_name.indexOf(this.keyword) != '-1') {
										houses2.push(this.houses[i]);
										A = true;
										break;
									}
								}
							}
						}
					}
				}
				return houses2;
			},
			isHouseEmpty(val) {
				let isEmpty = true;
				let houseClass = {
					padding: '0',
					cursor: 'pointer',
					background: ""
				};
				for (let key in val.rooms) {
					if (!strIsEmpty(val.rooms[key].tenant)) {
						isEmpty = false;
						break;
					}
				}
				if (isEmpty) {
					houseClass.background = "";
					return houseClass;
				} else {
					houseClass.background = "lightyellow";
					return houseClass;
				}
			},
			roomType(room) {
				let roomClass = {
					padding: "0",
					background: ""
				};
				if (!strIsEmpty(room.tenant)) {
					if (room.tenant.sex == 1) {
						roomClass.background = "skyblue"
					} else {
						roomClass.background = "pink"
					}
				}
				return roomClass;
			},
			openUpdHouse(house) {
				this.dialogUpdHouse = true;
				this.houseInfo.id = house.id;
				this.houseInfo.house_region = house.house_region;
				this.houseInfo.house_address = house.house_address;
			},
			//点击遮罩层什么都不做，不让dialog消失
			handleClose(done) {},
			openAddHouse() {
				this.dialogAddHouse = true;
				for (let key in this.houseInfo) {
					this.houseInfo[key] = "";
				}
			},
			//窗口取消按钮
			cancleDialog(refForm) {
				this.dialogUpdHouse = false;
				this.dialogAddHouse = false;
				this.dialogAddRoom = false;
				this.dialogUpdRoom = false;
				//重制样式
				this.$refs[refForm].resetFields();
			},
			updHouse(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("house/updHouse", {
							id: this.houseInfo.id,
							house_region: this.houseInfo.house_region,
							house_address: this.houseInfo.house_address,
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getHouseData();
								this.$message.success("房子信息修改成功！");
							} else {
								this.$message.error("房子信息修改失败，请联系管理员");
							}
						})
					} else {
						return false;
					}
				});
			},
			addHouse(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("house/addHouse", {
							house_region: this.houseInfo.house_region,
							house_address: this.houseInfo.house_address,
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getHouseData();
								this.$message.success("房子新增成功！");
							} else {
								this.$message.error("房子新增失败，请联系管理员");
							}
						})
					} else {
						return false;
					}
				});
			},
			openAddRoom(val) {
				this.dialogAddRoom = true;
				for (let key in this.roomInfo) {
					this.roomInfo[key] = ""
				}
				this.roomInfo.room_house_id = val.id;
				if (strIsEmpty(val.rooms)) {
					this.roomInfo.room_number = "A1"
				} else {
					let romNum = val.rooms.slice(-1)[0].room_number;
					let num = parseInt(romNum.replace(/[^0-9]/ig, "")) + 1;
					romNum = romNum[0] + num;
					this.roomInfo.room_number = romNum;
				}
			},
			addRoom(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("room/addRoom", {
							room_house_id: this.roomInfo.room_house_id,
							room_number: this.roomInfo.room_number,
							room_price: this.roomInfo.room_price,
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getHouseData();
								this.$message.success("房间新增成功！");
							} else {
								this.$message.error("房间新增失败，请联系管理员");
							}
						})
					} else {
						return false;
					}
				});
			},
			openUpdRoom(room) {
				for (let key in this.roomInfo) {
					this.roomInfo[key] = ""
				}
				this.dialogUpdRoom = true;

				this.roomInfo.id = room.id;
				this.roomInfo.room_number = room.room_number;
				this.roomInfo.room_price = room.room_price;
				this.roomInfo.room_tenant_id = strIsEmpty(room.tenant) ? "" : room.tenant.id;
				this.roomInfo.rental_date = room.rental_date;
				this.roomInfo.rent_collection_date = room.rent_collection_date;
				//加载租客数据
				this.$axios.get("tenant/findTenantNoRent").then(response => {
					this.tenantOptions = response.data;
					if (!strIsEmpty(room.tenant)) {
						this.tenantOptions.push({
							id: room.tenant.id,
							tenant_name: room.tenant.tenant_name
						})
					}
				})
			},
			updRoom(refForm) {
				this.$refs[refForm].validate((valid) => {
					if (valid) {
						//前台验证全部正确,数据提交
						this.$axios.post("room/updRoom", {
							id: this.roomInfo.id,
							room_number: this.roomInfo.room_number,
							room_tenant_id: this.roomInfo.room_tenant_id,
							room_price: this.roomInfo.room_price,
							rental_date: this.roomInfo.rental_date,
							rent_collection_date: this.roomInfo.rent_collection_date
						}).then(response => {
							if (response.data == 1) {
								this.cancleDialog(refForm);
								this.getHouseData();
								this.$message.success("房间更新成功！");
							} else {
								this.$message.error("房间更新失败，请联系管理员");
							}
						})
					} else {
						return false;
					}
				});
			},
			changeCollectionDate(val) {
				let oldDate = val.getTime();
				let newDate = new Date(oldDate + 2592000000 * 3);
				this.roomInfo.rent_collection_date = newDate
			},
			delRoom(refForm) {
				if (!strIsEmpty(this.roomInfo.room_tenant_id)) {
					this.$confirm('仍有用户入住该房间, 是否继续删除该房间?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'error'
					}).then(() => {
						this.$axios.post("room/delRoom", {
								id: this.roomInfo.id
							})
							.then(response => {
								if (response.data > 0) {
									this.$message.success("删除成功");
									this.cancleDialog(refForm);
									this.getHouseData();
								} else {
									this.$message.error("删除失败，联系管理员");
								}
							}).catch(() => {
								this.$message.error("网络不通，请联系管理员");
							});
					}).catch(() => {
						this.$message.info("已取消删除");
					});
				} else {
					this.$confirm('即将永久删除该房间, 是否继续?', '提示', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						this.$axios.post("room/delRoom", {
								id: this.roomInfo.id
							})
							.then(response => {
								if (response.data > 0) {
									this.$message.success("删除成功");
									this.cancleDialog(refForm);
									this.getHouseData();
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
			delHouse(val) {
				this.$confirm('如删除房子，房子下的所有房间都将被删除，是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'error'
				}).then(() => {
					this.$axios.post("house/delHouse", {
							id: val.id
						})
						.then(response => {
							if (response.data > 0) {
								this.$message.success("删除成功");
								this.getHouseData();
							} else {
								this.$message.error("删除失败，联系管理员");
							}
						}).catch(() => {
							this.$message.error("网络不通，请联系管理员");
						});
				}).catch(() => {
					this.$message.info("已取消删除");
				});
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
			this.getHouseData();
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
	.housepage {
		height: 857px;
	}

	.househeader {
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

	.housebody {
		padding-left: 20px;
		padding-right: 20px;
	}

	.house_region {
		text-align: center;
		border-bottom: 1px solid #F0F8FF;
		font-weight: 600;
		font-size: 18px;
		color: darkorange;
		letter-spacing: 1px;
		height: 36px;
		line-height: 36px;
	}

	.house_address {
		text-align: center;
		font-weight: 500;
		font-size: 16px;
		letter-spacing: 1px;
		height: 50px;
		line-height: 50px;
	}

	.roomscard {
		margin-left: 6px;
		margin-right: 6px;
		cursor: pointer;
	}

	.room_num {
		text-align: center;
		letter-spacing: 1px;
		border-bottom: 1px solid rgb(235, 238, 245);
		font-size: 14px;
		font-weight: 600;
		height: 30px;
		line-height: 30px;
	}

	.room_tenant_name {
		text-align: center;
		height: 35px;
		line-height: 35px;
		font-size: 15px;
		letter-spacing: 1px;
	}
	
	.el-pagination {
		margin-top: 15px;
		float: right;
	}
</style>
