<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="profile-container">
			<div class="user-info">
				<div class="column-left">
					<div class="user-card">
						<div class="pfp-container">
							<img class="pfp" :src="'data:image/' + userStore.user.pfpExt + ';base64,'+ userStore.user.pfp" alt="pfp" v-if="userStore.user && userStore.user.profilepicture" />
							<img class="pfp" src="/src/assets/pfps/default.png" alt="pfp" v-else>
						</div>
						<div class="user">
							<span class="username" v-show="userStore.user?.username">{{userStore.user?.username.length < 10 ? userStore.user?.username : userStore.user?.username.substring(0, 10) + '...' }}</span><br>
							<div class="recipe-count" v-show="recipeCount !== null"> Recipes: {{recipeCount}}</div>
						</div>
					</div>
				</div>
				<div class="column-right">
					<table class="user-info-table">
						<tr>
							<th>First name:</th>
							<td>{{userStore.user?.firstname ? userStore.user?.firstname : "-"}}</td>
						</tr>
						<tr>
							<th>Last name:</th>
							<td>{{userStore.user?.lastname ? userStore.user?.lastname : "-"}}</td>
						</tr>
						<tr>
							<th>Email:</th>
							<td>{{userStore.user?.email}}</td>
						</tr>
						<tr>
							<th>Member since:</th>
							<td>{{formattedMemberSinceDate}}</td>
						</tr>
					</table>
				</div>
			</div>
			<div class="buttons-container">
				<button class="change-password-btn" type="button"
						data-bs-toggle="modal"
						data-bs-target="#change-password-modal">
					Change password</button>
				<button class="edit-profile-btn" type="button">Edit profile</button>
			</div>
			<hr class="profile-divider"/>
			<div class="preferences-container">
				<span class="preferences-header-text">Preferences for weekly menu</span>
				<div class="preferences">
					<div class="allergens">
						<span>Exclude allergens: </span>
						<span v-show="userStore.user?.allergies.length === 0"><b>-</b></span>
						<div class="allergen" v-for="(allergen, index) in userStore.user?.allergies" :key="index">
							<span>{{allergen.name}}</span>
						</div>
					</div>
					<span>Max. recipe difficulty:
						<b>{{userStore.user?.difficultyPref.name ? userStore.user?.difficultyPref.name : "-"}}</b>
					</span>
					<span>Max. recipe cost:
						<b>{{userStore.user?.costPref.name ? userStore.user?.costPref.name : "-"}}</b>
					</span>
					<div class="buttons-container">
						<button class="edit-pref-btn" type="button">Edit preferences</button>
					</div>
				</div>
			</div>
		</div>
	</div>


	<div class="modal fade" id="change-password-modal" ref="change-password-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="change-password-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="modal-body change-password-modal-body">
					<form class="change-password-inputs">
						<label for="current-password">Current password:</label><br/>
						<input class="input-field" type="password" id="current-password" autocomplete="off" v-model="changePasswordInput.currentPassword"><br>
						<label for="new-password">New password:</label><br/>
						<input class="input-field" type="password" id="new-password" autocomplete="off" v-model="changePasswordInput.newPassword"><br>
						<label for="new-password-again">New password again:</label><br/>
						<input class="input-field" type="password" id="new-password-again" autocomplete="off" v-model="changePasswordInput.newPasswordAgain"><br>
					</form>
					<div class="change-password-alert alert alert-danger" v-if="changePasswordErrors.length !== 0">
						<strong>Editing failed!</strong><br>
						<ul>
							<li class="change-password-error-items" v-for="(error, index) in changePasswordErrors" :key="index">{{error}}</li>
						</ul>
					</div>
					<div class="change-password-button-container">
						<button class="change-password-button" @click="changePassword">Change password</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInNavGuard.js";
import {useUserStore} from "@/stores/userStore.js";
import {mapStores} from "pinia";
import axios from "axios";

export default {
	name: "Profile",
	beforeRouteEnter,

	data(){
		return {
			recipeCount: null,

			changePasswordInput: {
				currentPassword: "",
				newPassword: "",
				newPasswordAgain: "",
			},

			changePasswordErrors: [],
		}
	},

	methods: {
		async initRecipeCount(){
			try {
				const response = await axios.get(`/user/uploadedRecipeCount/${this.userStore.user.id}`);
				this.recipeCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async changePassword(){
			this.changePasswordErrors = this.checkChangePasswordInput;

			if(this.changePasswordErrors.length === 0){
				try {
					await this.axios.post("/user/edit/password", {
						currentPassword: this.changePasswordInput.currentPassword.trim(),
						newPassword: this.changePasswordInput.newPassword.trim(),
					});

					document.getElementById("change-password-close-button").click();

				} catch (error) {
					this.changePasswordErrors.push(...error.response.data.errorMessage);
					console.log(error.response.data);
				}
			}

		},

		clearChangePasswordFields(){
			this.changePasswordInput.currentPassword = "";
			this.changePasswordInput.newPassword = "";
			this.changePasswordInput.newPasswordAgain = "";
			this.changePasswordErrors = [];
		},

		setModalHandlers(){
			const changePasswordModal = document.getElementById('change-password-modal');
			changePasswordModal.addEventListener("hidden.bs.modal", () => this.clearChangePasswordFields());
		},
	},

	computed: {
		formattedMemberSinceDate(){
			return new Date(this.userStore.user?.joined.split(" ")[0]).toLocaleDateString("en-GB");

		},

		checkChangePasswordInput(){
			let errors = [];

			if(this.changePasswordInput.currentPassword.trim() === "" || this.changePasswordInput.newPassword.trim() === "" ||
			   this.changePasswordInput.newPasswordAgain.trim() === ""){
				errors.push("Please fill in all fields.");
			}

			if(this.changePasswordInput.newPassword.trim() !== "" && this.changePasswordInput.newPassword.trim().length < 6){
				errors.push("Password must be at least 6 characters long.")
			}

			if(this.changePasswordInput.newPassword !== this.changePasswordInput.newPasswordAgain){
				errors.push("Passwords do not match.");
			}

			return errors;
		},

		...mapStores(useUserStore),
	},

	watch: {
		'userStore.user'(){
			if(this.userStore.user){
				this.initRecipeCount();
			}
		},
	},

	mounted() {
		this.setModalHandlers();

		if(this.userStore.user){
			this.initRecipeCount();
		}
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 80px auto 140px auto;
		font-family: Gotu, serif;


		.profile-container {
			background-color: var(--lightgreen);
			border-radius: 20px;
			padding: 5% 10%;

			.user-info {
				display: flex;
				align-items: center;

				.column-left {
					display: flex;
					align-items: flex-start;
					justify-content: center;
					width: 40%;
					margin-right: 5%;

					.user-card {
						display: flex;
						align-items: center;
						justify-content: center;

						.pfp-container {
							display: flex;
							justify-content: center;
							align-items: center;

							width: 200px;
							height: 200px;

							background-color: white;
							border-radius: 100px;

							.pfp {
								width: 200px;
								height: 200px;

								object-fit: cover;
								border-radius: 100px;
								border: solid 5px white;
							}
						}
					}

					.user {
						margin-left: 25px;

						.username {
							font-size: 2rem;
						}

						.recipe-count {
							font-size: 0.9rem;
							white-space: nowrap;
						}
					}
				}

				.column-right {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					width: 60%;

					.user-info-table {
						width: 80%;
						border-collapse: collapse;

						tr {
							border-bottom: 1px solid black;

							&:last-child {
								border-bottom: 0;
							}

							th, td {
								padding: 15px 10px;
							}

							td {
								text-align: right;
							}
						}
					}
				}
			}

			.buttons-container {
				display: flex;
				justify-content: right;
				margin-left: auto;
				margin-right: auto;
				margin-top: 50px;
				width: 100%;

				.change-password-btn, .edit-profile-btn{
					border: 1px solid var(--lightgrey);
					border-radius: 10px;
					padding: 12px 30px;

					&:hover {
						opacity: 0.8;
					}
				}

				.change-password-btn{
					background-color: var(--darkgreen);
					margin-right: 20px;
				}

				.edit-profile-btn {
					background-color: var(--yellow);
					margin-right: 5%;
				}
			}

			.profile-divider {
				margin: 50px auto;
				color: var(--darkgrey);
			}

			.preferences-container {
				margin-left: auto;
				margin-right: auto;

				.preferences-header-text {
					font-size: 1.5rem;
				}

				.preferences {
					display: flex;
					flex-direction: column;
					gap: 30px;
					padding-left: 3%;

					:first-child {
						margin-bottom: -3px;
					}

					.allergens {
						display: flex;
						align-items: center;
						flex-wrap: wrap;
						gap: 15px;
						margin-top: 17px;

						.allergen {
							display: inline-block;
							background-color: var(--darkgreen);
							border-radius: 20px;
							border: 1px solid var(--lightgrey);
							padding: 3px 20px;
						}
					}

					.buttons-container {
						display: flex;
						justify-content: right;
						margin-left: auto;
						margin-right: auto;
						margin-top: 50px;
						width: 100%;

						.edit-pref-btn {
							border: 1px solid var(--lightgrey);
							border-radius: 10px;
							padding: 12px 30px;
							background-color: var(--yellow);
							margin-right: 5%;

							&:hover {
								opacity: 0.8;
							}
						}
					}
				}
			}
		}
	}

	.modal {
		font-family: Gotu, serif;
		margin-top: 70px;

		.modal-header {
			border-bottom: none;
		}

		.modal-body {
			margin: 0 10% 40px 10%;

			.change-password-inputs {
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
			}

			.change-password-alert {
				padding-bottom: 5px;
				padding-top: 20px;
			}

			.change-password-button-container {
				width: 100%;
				display: flex;
				flex-direction: row;
				justify-content: center;
				margin-top: 3%;

				.change-password-button {
					border: 1px solid var(--lightgrey);
					border-radius: 20px;
					background-color: var(--yellow);
					padding: 5px 30px;

					&:hover {
						opacity: 0.8;
					}
				}
			}
		}
	}

	@media screen and (max-width: 850px){
		.user-info {
			flex-direction: column;
			align-items: center;
		}

		.column-left, .column-right {
			width: 100% !important;
			padding: 5% !important;
			margin: 0 !important;

			.user-info-table {
				width: 100% !important;
			}

			.buttons-container {
				width: 100% !important;
				justify-content: center !important;
			}
		}

		.buttons-container {
			width: 100% !important;
			justify-content: center !important;
		}
	}

</style>