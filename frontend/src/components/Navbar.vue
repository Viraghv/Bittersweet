<template>
	<div class="mynavbar d-flex justify-content-between w-100 m-0">
		<router-link class="col-3 col-md-2 col-xl-1" :to="{name: 'Home'}">
			<img
				class="logo"
				src="@/assets/logo_yellow.png"
				alt="logo"
			/>
		</router-link>

		<div class="buttons col-lg-4 col-md-6 col-sm-8 row">
			<button type="button" class="login-button col-lg-4 col-md-5 col-sm-6" data-bs-toggle="modal" data-bs-target="#login-modal" v-if="!userStore.loggedIn">
				<img class="loginIcon" src="@/assets/icons/log-in_white.png" alt="login">
				Log in
			</button>

			<button type="button" class="signup-button col-lg-4 col-md-5 col-sm-6" data-bs-toggle="modal" data-bs-target="#signup-modal" v-if="!userStore.loggedIn">
				<img class="signUpIcon" src="@/assets/icons/add-user_white.png" alt="signup">
				Sign up
			</button>

			<button type="button" class="admin-button col-lg-3 col-md-3 col-sm-4" v-if="userStore.loggedIn && admin">
				<img class="lockIcon" src="@/assets/icons/lock.png" alt="lock">
				Admin
			</button>


			<button type="button" class="upload-recipe-button col-lg-5 col-md-5 col-sm-6" v-if="userStore.loggedIn" >
				<router-link class="upload-recipe-button" :to="{name: 'UploadRecipe'}">
					<img class="addIcon" src="@/assets/icons/add_icon_white.png" alt="add">
					<span>Upload recipe</span>
				</router-link>
			</button>

			<div class="profile-dropdown  dropdown dropdown-menu-end col-lg-1 col-md-2 col-sm-2" v-if="userStore.loggedIn">
				<div class="profile-button pfp-container" data-bs-toggle="dropdown" data-bs-offset="10,15">
					<img class="pfp" src="@/assets/pfps/default.png" alt="pfp">
				</div>
				<ul class="profile-dropdown-list dropdown-menu">
					<li><a class="dropdown-item" href="#">
						<img class="calendarIcon" src="@/assets/icons/calendar.png" alt="calendar">
						Weekly menu
					</a></li>
					<li><a class="dropdown-item" href="#">
						<img class="heartIcon" src="@/assets/icons/heart.png" alt="heart">
						Favourite
					</a></li>
					<li><a class="dropdown-item" href="#">
						<img class="shoppingListIcon" src="@/assets/icons/shopping-list.png" alt="shoppinglist">
						Shopping list
					</a></li>
					<li><a class="dropdown-item" href="#">
						<img class="profileIcon" src="@/assets/icons/profile.png" alt="profile">
						Profile
					</a></li>
					<li><hr class="dropdown-divider mx-auto"></li>
					<li><a class="dropdown-item" href="#" @click="logout">
						<img class="logoutIcon" src="@/assets/icons/logout.png" alt="logout">
						Log out
					</a></li>
				</ul>
			</div>
		</div>
	</div>


	<!-- The Modal -->
	<div class="modal fade" id="signup-modal" ref="signup-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="signup-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<!-- Modal body -->
				<div class="modal-body signup-modal-body">
					<form class="signup-inputs">
						<label for="username">Username:</label><br/>
						<input class="input-field" type="text" id="username" autocomplete="off" v-model="signupData.username" v-on:keydown.enter.exact.prevent="signup"><br>
						<label for="email">Email:</label><br/>
						<input class="input-field" type="email" id="email" autocomplete="off" v-model="signupData.email" v-on:keydown.enter.exact.prevent="signup"><br>
						<label for="password-signup">Password:</label><br/>
						<input class="input-field" type="password" id="password-signup" autocomplete="new-password" v-model="signupData.password" v-on:keydown.enter.exact.prevent="signup">
						<label for="password-again">Password again:</label><br/>
						<input class="input-field" type="password" id="password-again" autocomplete="off" v-model="signupData.passwordAgain" v-on:keydown.enter.exact.prevent="signup">
					</form>
					<div class="signup-alert alert alert-danger" v-if="signupErrorMsgs.length !== 0">
						<strong>Signup failed!</strong><br>
						<ul>
							<li class="signup-error-items" v-for="(error, index) in signupErrorMsgs" :key="index">{{error}}</li>
						</ul>
					</div>
					<div class="signup-button-container">
						<button class="signup-button" @click="signup">Sign up</button>
					</div>
					<hr class="signup-line" />
					<div class="have-account-container">
						<p>Already have an account?</p>
						<button class="login-button" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#login-modal">Log in here</button>
					</div>
				</div>


			</div>
		</div>
	</div>

	<div class="modal fade" id="login-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="login-close-button" type="button" class="btn-close"  data-bs-dismiss="modal"></button>
				</div>

				<!-- Modal body -->
				<div class="modal-body login-modal-body">

					<form class="login-inputs">
						<label for="username-login">Username:</label><br/>
						<input class="input-field" type="text" id="username-login" autocomplete="username" v-model="loginData.username" v-on:keydown.enter.exact.prevent="login"><br>
						<label for="password-login" >Password:</label><br/>
						<input class="input-field" type="password" id="password-login" autocomplete="current-password" v-model="loginData.password" v-on:keydown.enter.exact.prevent="login">
					</form>
					<div class="login-alert alert alert-danger" v-if="loginErrorMsgs.length !== 0">
						<strong>Login failed!</strong><br>
						<ul>
							<li class="login-error-items" v-for="(error, index) in loginErrorMsgs" :key="index">{{error}}</li>
						</ul>
					</div>
					<div class="login-button-container">
						<button class="login-button" @click="login">Log in</button>
					</div>
					<hr class="login-line" />
					<div class="no-account-container">
						<p>Don't have an account yet?</p>
						<button class="signup-button" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#signup-modal">Sign up here</button>
					</div>
				</div>


			</div>
		</div>
	</div>
</template>

<script>
import {useUserStore} from "@/stores/userStore.js";
import {mapStores} from "pinia";

export default {
	name: "Navbar",

	data() {
		return {
			loginData: {
				username: "",
				password: "",
			},

			signupData: {
				username: "",
				email: "",
				password: "",
				passwordAgain: "",
			},

			admin: false,
			loginErrorMsgs: [],
			signupErrorMsgs: [],
		}
	},
	methods: {
		clearLoginFields(){
			this.loginData.username = "";
			this.loginData.password = "";
			this.loginErrorMsgs = [];
		},

		clearSignupFields(){
			this.signupData.username = "";
			this.signupData.email = "";
			this.signupData.password = "";
			this.signupData.passwordAgain = "";
			this.signupErrorMsgs = [];
		},

		async login(){
			this.loginErrorMsgs = this.areLoginInputsValid;
			if (this.loginErrorMsgs.length === 0){
				try {
					let result = await this.axios.post("/user/login", {
						username: this.loginData.username,
						password: this.loginData.password,
					})
					const expirationDate = new Date(Date.now() + 24*60*60*1000);
					this.$cookies.set("sessionToken", result.data.sessionToken, expirationDate);
					this.$cookies.set("tokenExpiration", expirationDate.toString(), expirationDate);
					this.axios.defaults.headers.common["Authorization"] = result.data.sessionToken;
					this.userStore.login();
					document.getElementById("login-close-button").click();
				} catch (err) {
					this.loginErrorMsgs.push(...err.response.data.errorMessage);
					console.log(err)
				}
			}
		},

		async logout(){
			try {
				await this.axios.get("/user/logout");
				this.$cookies.remove("sessionToken");
				this.$cookies.remove("tokenExpiration");
				this.axios.defaults.headers.common["Authorization"] = "";
				this.userStore.logout();
				await this.$router.replace({name: 'Home'});
			} catch (error) {
				console.log(error);
			}
		},

		async signup() {
			this.signupErrorMsgs = this.areSignupInputsValid;
			if (this.signupErrorMsgs.length === 0) {
				try {
					await this.axios.post("/user/register", {
						username: this.signupData.username,
						email: this.signupData.email,
						password: this.signupData.password,
						passwordAgain: this.signupData.passwordAgain,
					})
					document.getElementById("signup-close-button").click();
				} catch (err) {
					this.signupErrorMsgs.push(...err.response.data.errorMessage);
				}
			}
		}
	},

	computed: {
		areSignupInputsValid(){
			let errors = [];

			if(this.signupData.username.trim() === "" || this.signupData.email.trim() === "" ||
			   this.signupData.password.trim() === "" || this.signupData.passwordAgain.trim() === ""){
				errors.push("Please fill in all fields");
			}

			if(this.signupData.username.trim().length > 100) {
				errors.push("Username can't be longer than 100 characters");
			}

			if(this.signupData.email.trim().length > 100) {
				errors.push("Email can't be longer than 100 characters");
			}

			if(this.signupData.email.trim() !== "" &&
			   !this.signupData.email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
				errors.push("Invalid email");
			}

			if(this.signupData.password.trim() !== "" && this.signupData.password.trim().length < 6){
				errors.push("Password must be at least 6 characters long")
			}

			if(this.signupData.password !== this.signupData.passwordAgain){
				errors.push("Passwords do not match");
			}

			return errors;
		},

		areLoginInputsValid(){
			let errors = [];

			if(this.loginData.username.trim() === "" || this.loginData.password.trim() === ""){
				errors.push("Please fill in all fields");
			}
			return errors;
		},

		...mapStores(useUserStore),
	},

	async mounted() {
		const loginModal = document.getElementById('login-modal');
		loginModal.addEventListener("hidden.bs.modal", () => this.clearLoginFields());
		const signupModal = document.getElementById('signup-modal');
		signupModal.addEventListener("hidden.bs.modal", () => this.clearSignupFields());


		try {
			await this.axios.get("/user/isLoggedIn");
			this.userStore.login();
			console.log("User is logged in.");
		} catch (err){
			this.userStore.logout();
		}
	}
}
</script>

<style scoped lang="scss">

.mynavbar {
	background-color: var(--darkgrey);
	padding: 2vh;
	align-items: center;

	.logo{
		width: 100%;
		margin-left: 10%;
	}

	.buttons{
		margin-right: 5%;
		button {
			background: none;
			border: none;
			font-family: Gotu, serif;
			color: white;
		}
		.signup-button {
			font-weight: bold;
		}

		.loginIcon, .signUpIcon, .addIcon {
			height: 1.5rem;
			margin-right: 1%;
		}

		.lockIcon {
			height: 1rem;
			margin-right: 1%;
		}

		.upload-recipe-button {
			font-family: Gotu,serif;
			text-decoration: none;
			color: white;

			&:hover{
				cursor: default;
			}

			img, span {
				&:hover{
					cursor: pointer;
				}
			}
		}
	}

	.pfp-container {
		width: 40px;
		height: 40px;
		background-color: var(--lightgreen);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		border-radius: 30px;
		border: solid 2px var(--lightgreen);

		overflow: hidden;


		.pfp {
			max-width: 40px;
			max-height: 40px;
		}

		&:hover {
			cursor: pointer;
		}
	}

	.profile-dropdown-list{
		background-color: var(--lightgreen);
		padding: 20px;
		width: 250px;
		border-radius: 15px;
		border-color: transparent;
		box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
		-webkit-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
		-moz-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);

		.calendarIcon, .heartIcon, .shoppingListIcon, .profileIcon, .logoutIcon {
			height: 1.3rem;
			margin-right: 5%;
		}

		.dropdown-item{
			margin-bottom: 5%;
			border-radius: 10px;

			&:hover {
				background-color: var(--darkgreen);
			}

			&:active {
				color: black;
			}
		}
	}

	.dropdown-menu::before {
		border-bottom: 9px solid rgba(0, 0, 0, 0.2);
		border-left: 9px solid rgba(0, 0, 0, 0);
		border-right: 9px solid rgba(0, 0, 0, 0);
		content: "";
		display: inline-block;
		left: 210px;
		position: absolute;
		top: -8px;
	}
	.dropdown-menu::after {
		border-bottom: 8px solid var(--lightgreen);
		border-left: 9px solid rgba(0, 0, 0, 0);
		border-right: 9px solid rgba(0, 0, 0, 0);
		content: "";
		display: inline-block;
		left: 210px;
		position: absolute;
		top: -7px;
	}
}

.modal {
	font-family: Gotu, serif;

	.modal-header {
		border-bottom: none;
	}

	.modal-body{
		.login-inputs, .signup-inputs{
			margin-left: 10%;
			margin-right: 10%;

			label {
				color: black;
			}

			.input-field {
				width: 100%;
				margin-top: 1%;
				margin-bottom: 4%;
				border-radius: 10px;
				border-width: 1px;
				border-color: var(--lightgrey);
				padding: 5px 10px;

				&:focus {
					outline: var(--darkgreen) solid 3px;
				}
			}
		}

		.login-button-container, .signup-button-container{
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: center;
			margin-top: 3%;

			.login-button, .signup-button {
				border: 1px solid var(--lightgrey);
				border-radius: 10px;
				background-color: var(--yellow);
				font-size: 1.2rem;
				padding: 5px 30px;

				&:hover {
					opacity: 0.8;
				}
			}
		}

		.login-line, .signup-line {
			width: 80%;
			margin: 8% auto;
		}

		.no-account-container, .have-account-container{
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;

			p {
				display: inline-block;
				text-align: center;
				margin-bottom: 2%;
			}

			.signup-button, .login-button {
				border: 1px solid var(--lightgrey);
				border-radius: 10px;
				background-color: var(--yellow);
				padding: 5px 30px;
				width: 40%;
				margin-bottom: 5%;

				&:hover {
					opacity: 0.8;
				}
			}
		}

		.alert {
			margin-left: 10%;
			margin-right: 10%;
			margin-bottom: 5%;

			.signup-error-items {
				font-size: 0.8rem;
			}

			&.signup-alert {
				padding-bottom: 5px;
			}
		}
	}



}
</style>
