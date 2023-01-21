<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="loader-container"  v-if="!successfulVerification && !tokenExpired">
			<Loader class="initLoader"/>
		</div>
		<div class="success" v-if="successfulVerification">
			<img class="verified-icon" src="@/assets/icons/verify_yellow.png" alt="verified">
			<div class="verified-text-container">
				<h1 class="verified-title">Verification successful!</h1>
				<p class="verified-text">
					Thank you for signing up to Bittersweet! <br>
					We hope you'll discover a lot of delicious recipes during your time with us.<br><br>
					You can now <span class="log-in-text" @click="openLoginModal">LOG IN</span> to your profile.
				</p>
			</div>
		</div>
		<div class="token-expired" v-else-if="tokenExpired">
			<img class="expired-icon" src="@/assets/icons/expired.png" alt="expired">
			<div class="expired-text-container">
				<h1 class="expired-title">Token expired!</h1>
				<p class="expired-text">
					Sorry, but your link has already expired. <br>
					The link is only active for <b>15 minutes</b> starting from when the email is sent.<br><br>
					Please <span class="sign-up-text" @click="openSignupModal">SIGN UP</span> again to receive a new one.
				</p>
			</div>
		</div>
	</div>
</template>

<script>
import {Modal} from "bootstrap";
import Loader from "@/components/Loader.vue";

export default {
	name: "EmailVerification",
	components: {Loader},

	props: {
		token: String,
	},

	data(){
		return {
			successfulVerification: false,
			tokenExpired: false,
		}
	},

	methods: {
		async verifyWithToken(){
			if(!this.token){
				this.$router.push({name: "Home"});
			}

			try {
				const response = await this.axios.get(`/user/verification/${this.token}`);
				this.successfulVerification = true;
			} catch (error) {
				console.log(error.response.data);

				if (error.response.data.errorMessage === "jwt malformed") {
					this.$router.push({name: "Home"});
				}

				if (error.response.data.errorMessage.includes("Verification link has expired.")){
					this.tokenExpired = true;
				}
			}
		},

		openLoginModal(){
			let loginModal = new Modal(document.getElementById("login-modal"), {});
			loginModal.show();
		},

		openSignupModal(){
			let signupModal = new Modal(document.getElementById("signup-modal"), {});
			signupModal.show();
		},
	},

	mounted() {
		this.verifyWithToken();
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 10vh auto 140px auto;
		font-family: Gotu, serif;

		.loader-container {
			display: flex;
			justify-content: center;
			margin-top: 70px;
		}

		.success, .token-expired {
			display: flex;
			align-items: center;

			.verified-icon, .expired-icon {
				width: 200px;
			}

			.verified-text-container, .expired-text-container{
				margin-left: 50px;

				.verified-title, .expired-title {
					font-weight: bold;
					font-size: 3rem;
				}

				.verified-text, .expired-text {
					font-size: 1.5rem;

					.log-in-text, .sign-up-text {
						font-weight: bold;
						text-decoration: underline;

						&:hover {
							cursor: pointer;
							opacity: 0.8;
						}
					}

					.log-in-text {
						color: var(--yellow);
					}

					.sign-up-text {
						color: var(--warning);
					}
				}
			}

		}
	}

	@media screen and (max-width: 865px){
		.success, .token-expired  {
			flex-direction: column;

			.verified-icon, .expired-icon {
				margin-bottom: 40px;
			}

			.verified-text-container, .expired-text-container {
				text-align: center;
				margin-left: 0 !important;

				.verified-title, .expired-title {
					font-size: 2rem !important;
				}

				.verified-text, .expired-text {
					font-size: 1rem !important;
				}
			}
		}
	}
</style>