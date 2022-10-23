<template>
	<div class="mynavbar d-flex justify-content-between w-100 m-0">
		<router-link class="col-3 col-md-2 col-xl-1" :to="{name: 'Home'}">
			<img
				class="logo"
				src="@/assets/logo_yellow.png"
				alt="logo"
			/>
		</router-link>

		<div class="buttons col-lg-2 col-md-3 col-sm-8 row">
			<button type="button" class="login-button w-50 col-md-2 col-sm-5" data-bs-toggle="modal" data-bs-target="#login-modal">
				<img class="loginIcon" src="@/assets/log-in_white.png" alt="login">
				Log in
			</button>

			<button type="button" class="signup-button w-50 col-md-2 col-sm-5" data-bs-toggle="modal" data-bs-target="#signup-modal">
				<img class="signUpIcon" src="@/assets/add-user_white.png" alt="signup">
				Sign up
			</button>
		</div>
	</div>


	<!-- The Modal -->
	<div class="modal fade" id="signup-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<!-- Modal body -->
				<div class="modal-body signup-modal-body">
					<div class="signup-inputs">
						<label for="username">Username:</label><br/>
						<input class="input-field" type="text" id="username" v-model="signupData.username"><br>
						<label for="email">Email:</label><br/>
						<input class="input-field" type="email" id="email" v-model="signupData.email"><br>
						<label for="password-signup">Password:</label><br/>
						<input class="input-field" type="password" id="password-signup" v-model="signupData.password">
						<label for="password-again">Password again:</label><br/>
						<input class="input-field" type="password" id="password-again" v-model="signupData.passwordAgain">
					</div>
					<div class="signup-button-container">
						<button class="signup-button">Sign up</button>
					</div>
					<hr class="signup-line" />
					<div class="have-account-container">
						<p>Already have an account?</p>
						<button class="login-button">Log in here</button>
					</div>
				</div>


			</div>
		</div>
	</div>

	<div class="modal fade" id="login-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button type="button" class="btn-close"  data-bs-dismiss="modal"></button>
				</div>

				<!-- Modal body -->
				<div class="modal-body login-modal-body">
					<div class="login-inputs">
						<label for="email-or-username">Email or username:</label><br/>
						<input class="input-field" type="text" id="email-or-username" v-model="loginData.emailUsername"><br>
						<label for="password-login" >Password:</label><br/>
						<input class="input-field" type="password" id="password-login" v-model="loginData.password">
					</div>
					<div class="login-button-container">
						<button class="login-button">Log in</button>
					</div>
					<hr class="login-line" />
					<div class="no-account-container">
						<p>Don't have an account yet?</p>
						<button class="signup-button">Sign up here</button>
					</div>
				</div>


			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Navbar",

	data() {
		return {
			loginData: {
				emailUsername: "",
				password: "",
			},

			signupData: {
				username: "",
				email: "",
				password: "",
				passwordAgain: "",
			},
		}
	},
	methods: {
		clearLoginFields(){
			this.loginData.emailUsername = "";
			this.loginData.password = "";
		},

		clearSignupFields(){
			this.signupData.username = "";
			this.signupData.email = "";
			this.signupData.password = "";
			this.signupData.passwordAgain = "";
		},
	},

	mounted() {
		const loginModal = document.getElementById('login-modal');
		loginModal.addEventListener("hidden.bs.modal", () => this.clearLoginFields())
		const signupModal = document.getElementById('signup-modal');
		signupModal.addEventListener("hidden.bs.modal", () => this.clearSignupFields())
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

		.loginIcon, .signUpIcon {
			height: 1.5rem;
			margin-right: 1%;
		}
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
			}
		}

	}



}
</style>
