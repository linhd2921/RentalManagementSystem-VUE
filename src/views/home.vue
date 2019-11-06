<template>
	<div class="home">
		<el-row class="header">
			<el-col :md="5" :offset="2">
				房子总数:{{totalHouse}}
			</el-col>
			<el-col :md="5">
				房间总数:{{totalRoom}}
			</el-col>
			<el-col :md="5">
				已出租房间总数:{{totalRentRoom}}
			</el-col>
			<el-col :md="5">
				本月房租总收入:{{totalRentPrice}}
			</el-col>
		</el-row>
		<el-row class="middle">
			<el-col :md="8">
				<div class="middelContainer">
					<div class="txtTitle">本月收入占比</div>
					<div id="bysrzbChart" ref="bysrzbChart"></div>
				</div>
			</el-col>
			<el-col :md="8">
				<div class="middelContainer">
					<div class="txtTitle">月度收入曲线</div>
					<div id="ydsrqxChart" ref="ydsrqxChart"></div>
				</div>
			</el-col>
			<el-col :md="8">
				<div class="middelContainer">
					<div class="txtTitle">逾期未缴费名单</div>
					<div class="noPriceTenantTable">
						<div v-show="!ifShowwjf()" class = "yhjjf">
							<img src="../assets/nodata.png" alt="" style="width: 100%,height:100%;">
							<span>用户均已缴费</span>
						</div>
						<div v-show="ifShowwjf()">
							<el-card v-for="(data,index) in wjfData" :key="index" class="tenantCard" :body-style="{padding:'0',position:'relative'}">
								<div class="region">
									{{data.house_region}}
								</div>
								<div class="wjfryInfo">
									<li>具体地址:{{data.house_address}}</li>
									<li>房间号码:{{data.room_number}}</li>
									<li>房间金额:{{data.room_price}}</li>
									<li>租客姓名:{{data.tenant_name}}</li>
									<li>联系方式:{{data.tenant_phone}}</li>
								</div>
								<div class="yqsj">
									<el-tag type="danger">已逾期:{{data.yqts}}天</el-tag>
								</div>
							</el-card>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-row class="below">
			<div class="belowContainer">
				<div class="txtTitle">本月应收名单</div>
				<div class="byysTable">
					<div v-show="!ifShowByys()" class = "bywxsz">
						<span>本月无需收租</span>
					</div>
					<div v-show="ifShowByys()" class="byysCardBody">
						<el-col :md="4" v-for="(data,index) in byysData" :key="index" class="byysCard">
							<el-tooltip class="item" effect="dark" content="如已收款,点击修改下次收租时间" placement="top-start" :enterable="false">
							<el-card :body-style="roomType(data)">
								<div @click.prevent="openUpdRoom(data)">
									<div class="jlts">
										距离收租日期：{{Math.abs(data.jlts)}}天
									</div>
									<div class="roomNumPrice">
										{{data.room_number}}:{{data.room_price}}
									</div>
									<div class="tenantInfo">
										{{data.tenant_name}}:{{data.tenant_phone}}
									</div>
								</div>
							</el-card>
							</el-tooltip>
						</el-col>
					</div>
				</div>
			</div>
		</el-row>
		
		<el-dialog title="修改房间信息" :visible.sync="dialogUpdRoom" width="25%" :before-close="handleClose" :showClose="false">
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
				<el-button @click="cancleDialog('updroomInfoFrom')">取 消</el-button>
				<el-button type="primary" @click="updRoom('updroomInfoFrom')">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import echarts from "echarts";
	import macarons from 'echarts/theme/macarons';

	export default {
		name: 'home',
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
				totalHouse: "",
				totalRoom: "",
				totalRentRoom: "",
				totalRentPrice: "",
				pieData: "",
				wjfData: [],
				byysData:[],
				roomInfo:{
					room_house_id: "", //所属房子id
					room_number: "", //房间标号
					room_price: "", //租金
					room_tenant_id: "", //租房人id
					room_tenant_name: "",
					rental_date: "", //入住日期
					rent_collection_date: "" //收租日期
				},
				dialogUpdRoom: false,
				tenantOptions:[],
				rules: {
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
				}
			}
		},
		methods: {
			getHeaderDatas() {
				this.$axios.get("home/homeHeader").then(response => {
					this.totalHouse = response.data.totalHouse;
					this.totalRoom = response.data.totalRoom;
					this.totalRentRoom = response.data.totalRentRoom;
					this.totalRentPrice = response.data.totalRentPrice;
				})
			},
			getBysrzbChartDatas() {
				this.$axios.get("home/homeRentPro").then(response => {
					let datas = [{
							value: response.data.totalNoRentPrice,
							name: "未出租房屋总金额"
						},
						{
							value: response.data.totalRentPrice,
							name: "已出租房屋总金额"
						}
					];
					this.pieData = datas;
					this.initBysrzbChart();
				});
			},
			initBysrzbChart() {
				var bysrzbChart = echarts.init(document.getElementById('bysrzbChart'), "macarons");
				bysrzbChart.setOption({
					tooltip: {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						padding: [50, 0, 0, 0]
					},
					series: [{
						name: '本月收入占比',
						type: 'pie',
						radius: '55%',
						center: ['50%', '60%'],
						data: this.pieData
					}]
				});
			},
			getYdsrqxChartDatas() {
				this.$axios.get("home/homeRentTrend").then(response => {
					let xDate = [];
					let yDate = [];
					for (let key in response.data) {
						xDate.unshift(response.data[key].data_date);
						yDate.unshift(response.data[key].totalRentPrice);
					};
					var ydsrqxChart = echarts.init(document.getElementById('ydsrqxChart'), "macarons");
					ydsrqxChart.setOption({
						tooltip: {
							trigger: 'axis'
						},
						xAxis: {
							type: 'category',
							data: xDate,
						},
						yAxis: {
							type: 'value'
						},
						series: [{
							name: "月度收入",
							type: 'line',
							data: yDate,
						}]
					});
				});
			},
			getNoRentTenantData() {
				this.$axios.get("home/findNoRentTenant").then(response => {
					this.wjfData = response.data;
				});
			},
			getByysTenantData() {
				this.$axios.get("home/findByysTenant").then(response => {
					this.byysData = response.data;
				});
			},
			//判断未缴费名单是否为空，为空则显示空的提示
			ifShowwjf(){
				if(strIsEmpty(this.wjfData)){
					return false;
				}
				return true;
			},
			//判断本月应收是否为空，如果为空则显示本月无需收租
			ifShowByys(){
				if(strIsEmpty(this.byysData)){
					return false;
				}
				return true;
			},
			//使得图表也变成响应式
			init() {
				const self = this; //因为箭头函数会改变this指向，指向windows。所以先把this保存
				window.onresize = function() {
					self.chart = echarts.init(self.$refs.bysrzbChart);
					self.chart.resize();
					self.chart = echarts.init(self.$refs.ydsrqxChart);
					self.chart.resize();
				}
			},
			roomType(room) {
				let roomClass = {
					padding: "0",
					background: ""
				};
				if (room.sex == 1) {
					roomClass.background = "skyblue"
				} else {
					roomClass.background = "pink"
				}
				return roomClass;
			},
			//点击遮罩层什么都不做，不让dialog消失
			handleClose(done) {},
			openUpdRoom(room) {
				for (let key in this.roomInfo) {
					this.roomInfo[key] = ""
				}
				this.dialogUpdRoom = true;
			
				this.roomInfo.id = room.room_id;
				this.roomInfo.room_number = room.room_number;
				this.roomInfo.room_price = room.room_price;
				this.roomInfo.room_tenant_id = room.room_tenant_id;
				this.roomInfo.rental_date = room.rental_date;
				this.roomInfo.rent_collection_date = room.rent_collection_date;
				//加载租客数据
				this.$axios.get("tenant/findTenantNoRent").then(response => {
					this.tenantOptions = response.data;
					this.tenantOptions.push({
						id: room.room_tenant_id,
						tenant_name: room.tenant_name
					})
				})
			},
			changeCollectionDate(val) {
				let oldDate = val.getTime();
				let newDate = new Date(oldDate + 2592000000 * 3);
				this.roomInfo.rent_collection_date = newDate
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
								this.getHeaderDatas();
								this.getNoRentTenantData();
								this.getByysTenantData();
								this.getBysrzbChartDatas();
								this.getYdsrqxChartDatas();
								this.$message.success("信息更新成功！");
							} else {
								this.$message.error("信息更新失败，请联系管理员");
							}
						})
					} else {
						return false;
					}
				});
			},
			//窗口取消按钮
			cancleDialog(refForm) {
				this.dialogUpdRoom = false;
				//重制样式
				this.$refs[refForm].resetFields();
			},
		},
		components: {},
		created() {
			this.getHeaderDatas();
			this.getNoRentTenantData();
			this.getByysTenantData();
		},
		mounted() {
			//需要在mounted后才能调用，否则会找不到元素
			this.getBysrzbChartDatas();
			this.getYdsrqxChartDatas();
			this.init();
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
	.home {
		height: 857px;
	}

	.header {
		text-align: center;
		margin: 0 20px;
		font-size: 20px;
		font-weight: 600;
		font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
		height: 50px;
		line-height: 50px;
		letter-spacing: 1.2px;
		background-color: wheat;
		color: gray;
	}

	.middle {
		margin: 10px 20px;
		border: 1px solid aliceblue;
		height: 400px;
	}

	.middelContainer {
		height: 390px;
		padding: 5px;
		border-right: 1px solid aliceblue;
		position: relative;

	}

	.txtTitle {
		position: absolute;
		border-bottom: 1px solid rgb(243, 243, 243);
		border-right: 1px solid rgb(243, 243, 243);
		left: 0px;
		top: 0px;
		width: 150px;
		height: 26px;
		text-align: center;
		line-height: 26px;
		font-size: 17px;
		letter-spacing: 1px;
		font-weight: 600;
	}

	#bysrzbChart,
	#ydsrqxChart {
		width: 100%;
		height: 100%;

	}

	.noPriceTenantTable {
		margin-top: 26px;
		width: 100%;
		height: 364px;
		overflow: auto;
		position: relative;
	}

	.tenantCard {
		margin-bottom: 5px;
		    position: relative;
	}

	.region {
		text-align: center;
		border-bottom: 1px solid #F0F8FF;
		font-weight: 600;
		font-size: 18px;
		color: darkorange;
		letter-spacing: 1px;
		height: 36px;
		line-height: 36px;
	}

	.wjfryInfo {
		list-style: none;
		font-size: 15px;
		font-weight: 500;
		letter-spacing: 1px;
		width: 66%;
		border-right: 1px solid#F0F8FF;
		padding: 7px 0 7px 11px;
	}

	.yqsj {
		height: 100%;
		text-align: center;
		line-height: 100%;
		position: absolute;
		height: 100%;
		top: 50%;
		left: 76%;
	}
	.yhjjf{
		width: 100%;
		height: 100%;
		text-align: center;
	}
	.yhjjf img{
		width: 90%;
		height: 90%;
	}
	.yhjjf span{
		position: absolute;
		top: 27%;
		left: 23%;
		font-size: -webkit-xxx-large;
		color: cadetblue;
		font-weight: 700;
		letter-spacing: 1px;
	}
	.belowContainer {
		height: 365px;
		padding: 5px;
		border: 1px solid aliceblue;
		margin: 0 20px 10px;
		position: relative;
	}
	.byysTable {
		width: 100%;
		height: 365px;
		overflow: auto;
		position: relative;
	}
	.bywxsz{
		text-align: center;
		line-height: 350px;
	}
	.bywxsz span{
		font-size: 100px;
		color: cadetblue;
		font-weight: 700;
		letter-spacing: 5px;
	}
	.byysCardBody{
		position: relative;
		padding-left: 40px;
		padding-right: 40px;
		overflow: auto;
		height: 330px;
		margin-top: 35px;
	}
	.jlts {
		text-align: center;
		border-bottom: 1px solid rgb(235, 238, 245);
		font-weight: 600;
		font-size: 15px;
		letter-spacing: 1px;
		height: 36px;
		line-height: 36px;
	}
	.roomNumPrice{
		text-align: center;
		font-size: 15px;
		font-weight: 600;
		border-bottom: 1px solid aliceblue;
		padding: 3px;
	}
	.tenantInfo{
		text-align: center;
		font-size: 15px;
		font-weight: 600;
		border-bottom: 1px solid aliceblue;
		padding: 5px;
	}
	
	.byysCard {
		margin-left: 8px;
		margin-right: 8px;
		cursor: pointer;
	}
</style>
