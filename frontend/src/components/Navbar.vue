<template>
	<div class="mynavbar">
		<router-link :to="{name: 'Home'}">
			<img
				class="logo"
				src="@/assets/logo_yellow.png"
				alt="logo"
			/>
		</router-link>

		<div class="buttons">
			<button type="button" class="login-button" data-bs-toggle="modal" data-bs-target="#login-modal" v-if="!userStore.loggedIn">
				<img class="loginIcon" src="@/assets/icons/log-in_white.png" alt="login">
				<span>Log in</span>
			</button>

			<button type="button" class="signup-button" data-bs-toggle="modal" data-bs-target="#signup-modal" v-if="!userStore.loggedIn">
				<img class="signUpIcon" src="@/assets/icons/add-user_white.png" alt="signup">
				<span>Sign up</span>
			</button>

			<button type="button" class="admin-button" v-if="userStore.loggedIn && admin">
				<router-link class="admin-button" :to="{name: 'UsersAdmin'}">
					<img class="lockIcon" src="@/assets/icons/lock_white.png" alt="lock">
					<span>Admin</span>
				</router-link>
			</button>


			<button type="button" class="upload-recipe-button" v-if="userStore.loggedIn" >
				<router-link class="upload-recipe-button" :to="{name: 'UploadRecipe'}">
					<img class="addIcon" src="@/assets/icons/add_icon_white.png" alt="add">
					<span>Upload recipe</span>
				</router-link>
			</button>

			<div class="profile-dropdown  dropdown dropdown-menu-end" v-if="userStore.loggedIn">
				<div class="profile-button pfp-container" data-bs-toggle="dropdown" data-bs-offset="10,15">
					<img class="pfp" :src="'data:image/' + userStore.user.pfpExt + ';base64,'+ userStore.user.pfp" alt="pfp" v-if="userStore.user && userStore.user.profilepicture" />
					<img class="pfp" src="@/assets/default_pfp.png" alt="pfp" v-else>
				</div>
				<ul class="profile-dropdown-list dropdown-menu">
					<li><router-link class="dropdown-item" :to="{name: 'WeeklyMenu', params: {nextWeek: 0}}">
						<img class="calendarIcon" src="@/assets/icons/calendar.png" alt="calendar">
						Weekly menu
					</router-link></li>
					<li><router-link class="dropdown-item" :to="{name: 'Favourites'}">
						<img class="heartIcon" src="@/assets/icons/heart.png" alt="heart">
						Favourite
					</router-link></li>
					<li><router-link class="dropdown-item" :to="{name: 'ShoppingList'}" >
						<img class="shoppingListIcon" src="@/assets/icons/shopping-list.png" alt="shoppinglist">
						Shopping list
					</router-link></li>
					<li><router-link class="dropdown-item" :to="{name: 'Profile'}">
						<img class="profileIcon" src="@/assets/icons/profile.png" alt="profile">
						Profile
					</router-link></li>
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
					<div class="signup-alert alert alert-success" v-if="showSignupSuccessMsg">
						<strong>Signup successful!</strong><br>
						<span class="signup-success-text">To log in, please verify your email by clicking the link in the email we sent to your given address!</span><br>
						<span class="signup-success-text">The link expires in <strong>15 minutes</strong>!</span>
					</div>
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
						<div class="forgot-password-link">
							<span class="forgot-password" @click="changeToForgotPasswordModal">Forgot password?</span>
						</div>
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

	<div class="modal fade" id="forgot-password-modal" ref="forgot-password-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="forgot-password-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="forgot-password">
					<label class="forgot-password-label" for="forgot-password">Email:</label>
					<form class="forgot-password-form">
						<input class="forgot-password-input" name="forgot-password" v-model="forgotPasswordEmail"/>

						<div class="forgot-password-alert-success alert alert-success" v-if="forgotPasswordSuccess">
							<span>The new password has been sent out!</span>
						</div>
						<div class="forgot-password-alert alert alert-danger" v-if="forgotPasswordErrorMsgs.length !== 0">
							<strong>Error!</strong><br>
							<ul>
								<li class="forgot-password-error-items" v-for="(error, index) in forgotPasswordErrorMsgs" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="send-button" type="button" @click="sendForgotPassword">Send new password</button><br>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {useUserStore} from "@/stores/userStore.js";
import {mapStores} from "pinia";
import {Modal} from "bootstrap";
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
			showSignupSuccessMsg: false,

			forgotPasswordEmail: "",
			forgotPasswordErrorMsgs: [],
			forgotPasswordSuccess: false,

			loginErrorsRefresher: 0,
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
			this.showSignupSuccessMsg = false;
		},

		clearForgotPasswordFields(){
			this.forgotPasswordEmail = "";
			this.forgotPasswordErrorMsgs = [];
			this.forgotPasswordSuccess = false;
		},

		async login(){
			this.loginErrorsRefresher++;
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

					await this.userStore.login();
					await this.initUser();
					await this.initAdmin();

					document.getElementById("login-close-button").click();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.loginErrorMsgs.push(...error.response.data.errorMessage);
					} else {
						this.loginErrorMsgs.push(error.response.data.errorMessage);
					}
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
				this.$router.push({name: 'Home'});
			} catch (error) {
				console.log(error);
			}
		},

		async signup() {
			this.signupErrorMsgs = this.areSignupInputsValid;
			this.showSignupSuccessMsg = false;
			if (this.signupErrorMsgs.length === 0) {
				try {
					await this.axios.post("/user/register", {
						username: this.signupData.username,
						email: this.signupData.email,
						password: this.signupData.password,
						passwordAgain: this.signupData.passwordAgain,
					});

					this.clearSignupFields();
					this.showSignupSuccessMsg = true;


				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.signupErrorMsgs.push(...error.response.data.errorMessage);
					} else {
						this.signupErrorMsgs.push(error.response.data.errorMessage);
					}
				}
			}
		},

		async initUser(){
			try {
				const userResponse = await this.axios.get(`/user/getCurrentUser`);
				let user = userResponse.data;

				if(user.profilepicture){
					const pfpResponse = await this.axios.get(`/user/pfp/${user.profilepicture}`);

					user.pfp = pfpResponse.data;
					user.pfpExt = user.profilepicture.split(".")[1];
				}

				this.userStore.setUser(user);
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initAdmin(){
			try {
				const response = await this.axios.get('/user/isAdmin');
				this.admin = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async sendForgotPassword(){
			this.forgotPasswordErrorMsgs = [];
			if(this.forgotPasswordEmail !== ""){
				try {
					await this.axios.post("/user/forgotPassword", {
						email: this.forgotPasswordEmail,
					});

					this.forgotPasswordSuccess = true;

				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.forgotPasswordErrorMsgs.push(...error.response.data.errorMessage);
					} else {
						this.forgotPasswordErrorMsgs.push(error.response.data.errorMessage);
					}
				}
			}
		},

		changeToForgotPasswordModal(){
			document.getElementById("login-close-button").click();
			let forgotPasswordModal = new Modal(document.getElementById("forgot-password-modal"), {});
			forgotPasswordModal.show();
		},

	},

	computed: {
		areSignupInputsValid(){
			let errors = [];

			if(this.signupData.username.trim() === "" || this.signupData.email.trim() === "" ||
			   this.signupData.password.trim() === "" || this.signupData.passwordAgain.trim() === ""){
				errors.push("Please fill in all fields.");
			}

			if(this.signupData.username.trim().length > 100) {
				errors.push("Username can't be longer than 100 characters.");
			}

			if(this.signupData.email.trim().length > 100) {
				errors.push("Email can't be longer than 100 characters.");
			}

			if(this.signupData.email.trim() !== "" &&
			   !this.signupData.email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
				errors.push("Invalid email.");
			}

			if(this.signupData.password.trim() !== "" && this.signupData.password.trim().length < 6){
				errors.push("Password must be at least 6 characters long.")
			}

			if(this.signupData.password !== this.signupData.passwordAgain){
				errors.push("Passwords do not match.");
			}

			return errors;
		},

		areLoginInputsValid(){
			this.loginErrorsRefresher;

			let errors = [];

			if(this.loginData.username.trim() === "" || this.loginData.password.trim() === ""){
				errors.push("Please fill in all fields.");
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
		const forgotPasswordModal = document.getElementById('forgot-password-modal');
		forgotPasswordModal.addEventListener("hidden.bs.modal", () => this.clearForgotPasswordFields());


		try {
			await this.axios.get("/user/isLoggedIn");
			await this.userStore.login();
			await this.initUser();
			await this.initAdmin();
			console.log("User is logged in.");
		} catch (err){
			this.userStore.logout();
		}
	}
}
</script>

<style scoped lang="scss">

.mynavbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	background-color: var(--darkgrey);
	padding: 2vh 4vh;
	z-index: 200;

	.logo{
		width: 175px;
		margin-left: 10%;
		height: 40px;
	}

	.buttons{
		margin-right: 15%;
		display: flex;
		justify-content: right;
		gap: 30%;

		button {
			background: none;
			border: none;
			font-family: Gotu, serif;
			color: white;

			span {
				display: block;
				white-space: nowrap;
			}
		}
		.signup-button {
			font-weight: bold;
			margin-left: 10%;
		}

		.loginIcon, .signUpIcon, .addIcon {
			height: 1.5rem;
			margin-right: 1%;
		}

		.loginIcon, .signUpIcon {
			margin-right: 15%;
		}

		.lockIcon {
			height: 1rem;
			margin-right: 1%;
		}

		.upload-recipe-button, .admin-button, .signup-button, .login-button {
			font-family: Gotu,serif;
			text-decoration: none;
			color: white;
			display: flex;
			align-items: center;

			&:hover{
				cursor: pointer;
			}

			.addIcon {
				margin-top: -2px;
				margin-right: 7px;
			}
		}

		.admin-button {
			.lockIcon {
				margin-top: -3px;
				margin-right: 7px;
			}
		}
	}



	.pfp-container {
		display: flex;
		justify-content: center;
		align-items: center;

		width: 40px;
		height: 40px;

		background-color: var(--lightgreen);
		border-radius: 30px;

		.pfp {
			width: 40px;
			height: 40px;

			object-fit: cover;
			border-radius: 30px;
			border: solid 2px var(--lightgreen);
		}

		&:hover {
			cursor: pointer;
		}
	}

	.profile-dropdown-list{
		background-color: var(--lightgreen);
		padding: 20px;
		width: 250px;
		border-radius: 20px;
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
	margin-top: 70px;

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
					outline: var(--darkestgreen) solid 3px;
				}
			}

			.forgot-password-link {
				color: var(--warning);
				font-size: 0.9rem;

				.forgot-password {
					text-decoration: underline;
					text-align: right;
					margin-left: 0;
					margin-right: 0;

					&:hover {
						cursor: pointer;
						opacity: 0.8;
					}
				}
			}

			#password-login {
				margin-bottom: 2%;
			}
		}

		.login-alert, .signup-alert{
		  padding-bottom: 5px;
		  padding-top: 20px;
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

			.signup-error-items, .login-error-items {
				font-size: 0.8rem;
			}

			&.signup-alert {
				padding-bottom: 5px;
			}

			.signup-success-text {
				display: inline-block;
				font-size: 0.9rem;
				margin-top: 10px;
			}
		}
	}

	.forgot-password {
		margin: 0 10% 30px 10%;
		text-align: left;
		display: flex;
		flex-direction: column;

		.forgot-password-form{
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.forgot-password-input {
			width: 100%;
			margin-top: 1%;
			margin-bottom: 4%;
			border-radius: 10px;
			border-width: 1px;
			border-color: var(--lightgrey);
			padding: 5px 10px;

			&:focus {
				outline: var(--darkestgreen) solid 3px;
			}
		}

		.send-button {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			//margin-top: 15px;
			background-color: var(--yellow);

			&:hover {
				opacity: 0.8;
			}
		}

		.forgot-password-alert-success, .forgot-password-alert  {
			width: 100%;
		}

		.forgot-password-alert  {
			.forgot-password-error-items {
				font-size: 0.8rem;
			}
		}
	}


}
</style>
