<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="UserAdmin"/>
		</div>
		<div class="main-container">
			<div class="filters-container">
				<div class="left">
					<Multiselect class="search-by-multiselect" v-model="selectedSearchBy" :options="searchByOptions" :searchable="false" :can-clear="false" :can-deselect="false"/>
					<input class="searchbar" type="text" v-model="searchTerm" :placeholder="searchbarPlaceholder" @keydown.enter="searchForUser">
					<button type="button" class="search-button" @click="searchForUser">
						<img class="search-icon" src="@/assets/icons/magnifying-glass_white.png" alt="Search">
					</button>
				</div>
				<div class="right">
					<label class="sort-label" for="sort-input">Sort by:</label>
					<Multiselect class="sort-input" name="sort-input" v-model="selectedSortType" :options="sortTypeOptions" :searchable="false" :can-clear="false" :can-deselect="false"/>
				</div>
			</div>
			<div class="users-table-container">
				<table class="users-table">
					<tr class="header-row">
						<th class="first-header">ID</th>
						<th>Username</th>
						<th>Email</th>
						<th>Joined</th>
						<th class="last-header" colspan="2">Status</th>
					</tr>
					<tr v-for="(user, index) in users" :key="index">
						<td>{{user.id}}</td>
						<td>{{user.username.length < 30 ? user.username : user.username.substring(0, 30) + '...' }}</td>
						<td>{{user.email.length < 30 ? user.email : user.email.substring(0, 30) + '...' }}</td>
						<td>{{new Date(user.joined.split(" ")[0]).toLocaleDateString("en-GB")}}</td>
						<td>
							<div class="admin-badge" v-if="user.emailVerified && user.admin">
								<span>Admin</span>
							</div>
							<div class="verified-badge" v-else-if="user.emailVerified">
								<span>Verified</span>
							</div>
							<div class="unverified-badge" v-else>
								<span>Unverified</span>
							</div>
						</td>
						<td class="options-icon-cell">
							<img class="options-icon" src="@/assets/icons/dots_grey.png" alt="options-icon"
								 :id="'options-icon' + index" data-bs-toggle="dropdown"  aria-expanded="false" data-bs-offset="20, 17">
							<ul class="dropdown-menu dropdown-menu-end options-dropdown" :aria-labelledby="'options-icon' + index">
								<li class="dropdown-item" @click="openEditModal(user.id)">
									<img class="edit-icon icon" src="@/assets/icons/edit.png" alt="edit">
									Edit
								</li>
								<li class="dropdown-item" @click="">
									<img class="password-icon icon" src="@/assets/icons/password.png" alt="password">
									Change password
								</li>
								<li class="dropdown-item" @click="" v-if="!user.emailVerified">
									<img class="verify-icon icon" src="@/assets/icons/verify.png" alt="verify">
									Verify
								</li>
								<li class="dropdown-item" @click="" v-else>
									<img class="verify-icon icon" src="@/assets/icons/verify.png" alt="verify">
									Revoke verification
								</li>
								<li class="dropdown-item" @click="" v-if="!user.admin">
									<img class="admin-icon icon" src="@/assets/icons/lock_black.png" alt="admin">
									Give admin role
								</li>
								<li class="dropdown-item" @click="" v-else>
									<img class="admin-icon icon" src="@/assets/icons/lock_black.png" alt="admin">
									Revoke admin role
								</li>
								<li class="dropdown-item" @click="">
									<img class="delete-icon icon" src="@/assets/icons/bin.png" alt="delete">
									Delete
								</li>
							</ul>
						</td>
					</tr>
				</table>
			</div>
			<div class="pagination-container">
				<Pagination :total-items="usersCount" :items-per-page="25" @change-page="initUsers"/>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-profile-modal" ref="edit-profile-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-profile-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="modal-body edit-profile-modal-body">
					<form class="edit-profile-inputs">
						<label for="username">Username:</label><br/>
						<input class="input-field" type="text" id="username" v-model="editProfileInputs.username"><br>
						<label for="email">Email:</label><br/>
						<input class="input-field" type="text" id="email" v-model="editProfileInputs.email"><br>
						<label for="firstname">First name:</label><br/>
						<input class="input-field" type="text" id="firstname" v-model="editProfileInputs.firstname"><br>
						<label for="lastname">Last name:</label><br/>
						<input class="input-field" type="text" id="lastname" v-model="editProfileInputs.lastname"><br>
						<label for="pfp-input">Profile picture:</label><br>
						<div class="pfp-upload-container">
							<div class="buttons-container">
								<label class="upload-btn" for="pfp-input">Upload</label>
								<input type="file"
									   id="pfp-input"
									   name="pfp-input"
									   ref="pfpInput"
									   accept="image/png, image/jpeg"
									   @change="showPfpPreview($event)">
								<button class="remove-pfp-btn" type="button" @click="removePfp">Remove</button>
							</div>
							<div class="pfp-preview-container">
								<img id="pfp-preview-img" alt="pfp-preview"/>
								<img id="pfp-current" class="pfp" :src="'data:image/' + userPfpData.pfpExt + ';base64,'+ userPfpData.image" alt="pfp"
									 v-if="editProfileInputs.pfp === null && userPfpData.profilepicture && !dontShowCurrentPfp" />
								<img id= "default-pfp" class="pfp" src="/src/assets/default_pfp.png" alt="pfp" v-else-if="editProfileInputs.pfp === null">
							</div>
						</div>
					</form>
					<div class="edit-profile-alert alert alert-danger" v-if="allEditProfileErrors.length !== 0">
						<strong v-show="editProfileErrors.length !== 0">Editing failed!</strong>
						<strong v-show="uploadPfpErrors.length !== 0">Error!</strong><br>
						<ul>
							<li class="edit-profile-error-items" v-for="(error, index) in allEditProfileErrors" :key="index">{{error}}</li>
						</ul>
					</div>
					<div class="edit-profile-button-container">
						<button class="edit-profile-button" @click="editProfile()">Edit profile</button>
						<Loader class="loader" v-if="editProfileShowLoader"/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInAndAdminNavGuard.js";
import AdminNavbar from "@/components/AdminNavbar.vue";
import Multiselect from '@vueform/multiselect';
import Pagination from "@/components/Pagination.vue";
import Loader from "@/components/Loader.vue";
import {Modal} from "bootstrap";

export default {
	name: "UsersAdmin",
	beforeRouteEnter,

	components: {
		Loader,
		Pagination,
		AdminNavbar,
		Multiselect
	},

	data() {
		return {
			selectedSearchBy: "id",
			searchByOptions: {
				id: "ID",
				username: "Username",
				email: "Email"
			},

			searchTerm: "",

			selectedSortType: "idDesc",
			sortTypeOptions: {
				idAsc: "ID &#8593",
				idDesc: "ID &#8595",
				usernameAsc: "Username &#8593",
				usernameDesc: "Username &#8595",
				emailAsc: "Email &#8593",
				emailDesc: "Email &#8595",
				joinedAsc: "Joined &#8593",
				joinedDesc: "Joined &#8595",
				statusAsc: "Status &#8593",
				statusDesc: "Status &#8595",
			},

			users: [],
			usersCount: 0,

			currentPage: 1,

			editProfileInputs: {
				username: "",
				email: "",
				firstname: "",
				lastname: "",
				pfp: null,
				deletePfp: false,
			},

			userPfpData: {
				profilepicture: null,
				image: null,
				pfpExt: "",
			},

			editProfileErrors: [],
			uploadPfpErrors: [],
			dontShowCurrentPfp: false,
			editProfileShowLoader: false,
			currentUserId: null,
		}
	},

	methods: {
		showPfpPreview(event){
			this.uploadPfpErrors = [];

			if(event.target.files.length === 0){
				return;
			}

			if(event.target.files[0].type !== "image/jpeg" && event.target.files[0].type !== "image/png"){
				this.uploadPfpErrors.push("Incorrect file type.")
			}

			if(event.target.files[0].size > 1024000){
				this.uploadPfpErrors.push("File can't be bigger than 1MB.")
			}

			if(this.uploadPfpErrors.length > 0){
				return;
			}

			this.editProfileInputs.pfp = event.target.files[0];
			let src = URL.createObjectURL(event.target.files[0]);
			let preview = document.getElementById("pfp-preview-img");
			preview.src = src;
			preview.style.display = "block";

			this.editProfileInputs.deletePfp = false;
		},

		clearFileInput(input) {
			try {
				input.value = null;
			} catch(ex) { }
			if (input.value) {
				input.parentNode.replaceChild(input.cloneNode(true), input);
			}
		},

		removePfp(){
			this.editProfileInputs.deletePfp = true;

			let preview = document.getElementById("pfp-preview-img");
			preview.src = null;
			preview.style.display = "none";

			let fileInput = document.getElementById("pfp-input");
			this.clearFileInput(fileInput);

			this.editProfileInputs.pfp = null;
			this.dontShowCurrentPfp = true;
		},

		async initUsersCount(){
			try {
				const response = await this.axios.post(`/user/admin/all/count`, this.searchObj)
				this.usersCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initUsers(page){
			try {
				const response = await this.axios.post(`/user/admin/all/${this.selectedSortType}/${page}`, this.searchObj);
				this.users = response.data;
				this.currentPage = page;
			} catch (error) {
				console.log(error.response.data);

			}
		},

		async initUser(userId){
			try {
				const userResponse = await this.axios.get(`/user/admin/getUser/${userId}`);
				this.editProfileInputs.username = userResponse.data.username;
				this.editProfileInputs.email = userResponse.data.email;
				this.editProfileInputs.firstname = userResponse.data.firstname;
				this.editProfileInputs.lastname = userResponse.data.lastname;

				this.userPfpData.profilepicture = userResponse.data.profilepicture;

				if(this.userPfpData.profilepicture){
					const pfpResponse = await this.axios.get(`/user/pfp/${this.userPfpData.profilepicture}`);

					this.userPfpData.image = pfpResponse.data;
					this.userPfpData.pfpExt = this.userPfpData.profilepicture.split(".")[1];
				}

			} catch (error) {
				console.log(error.response.data);
			}
		},

		async editProfile(){
			this.editProfileErrors = this.checkEditProfileInput;
			this.uploadPfpErrors = [];

			if(this.editProfileErrors.length === 0){
				this.editProfileShowLoader = true;
				try {
					await this.axios.post(`/user/admin/edit/profile/${this.currentUserId}`, {
						username: this.editProfileInputs.username.trim(),
						email: this.editProfileInputs.email.trim(),
						firstname: this.editProfileInputs.firstname?.trim(),
						lastname: this.editProfileInputs.lastname?.trim(),
						deletePfp: this.editProfileInputs.deletePfp,
					});

					if(this.editProfileInputs.pfp){
						const formData = new FormData();
						formData.append('image', this.editProfileInputs.pfp);

						await this.axios.post(
							`/user/admin/edit/uploadImage/${this.currentUserId}`,
							formData,
							{
								headers: {
									'Content-Type': 'multipart/form-data'
								}
							}
						)
					}

					await this.initUsers(this.currentPage);

					this.editProfileShowLoader = false;
					document.getElementById("edit-profile-close-button").click();
				} catch (error) {
					this.editProfileShowLoader = false;
					if(Array.isArray(error.response.data.errorMessage)){
						this.editProfileErrors.push(...error.response.data.errorMessage);
					} else {
						this.editProfileErrors.push(error.response.data.errorMessage);
					}
				}
			}

		},

		searchForUser(){
			this.initUsers(1);
			this.initUsersCount();
			this.currentPage = 1;

			let paginateButtons = document.getElementsByClassName("paginate-buttons");

			for (let i = 0; i < paginateButtons.length; i++) {
				if(paginateButtons[i].innerHTML === "1"){
					paginateButtons[i].click();
				}
			}
		},

		openEditModal(userId){
			this.initUser(userId);
			let editModal = new Modal(document.getElementById("edit-profile-modal"), {});
			editModal.show();

			this.currentUserId = userId;
		},

		clearEditProfileFields(){
			this.editProfileInputs.username = "";
			this.editProfileInputs.email = "";
			this.editProfileInputs.firstname = "";
			this.editProfileInputs.lastname = "";
			this.editProfileInputs.pfp = null;
			this.editProfileInputs.deletePfp = false;
			this.editProfileErrors = [];
			this.uploadPfpErrors = [];

			let preview = document.getElementById("pfp-preview-img");
			preview.src = null;
			preview.style.display = "none";

			let fileInput = document.getElementById("pfp-input");
			this.clearFileInput(fileInput);

			this.dontShowCurrentPfp = false;
		},

		setModalHandlers(){
			// const changePasswordModal = document.getElementById('change-password-modal');
			// changePasswordModal.addEventListener("hidden.bs.modal", () => this.clearChangePasswordFields());

			const editProfileModal = document.getElementById('edit-profile-modal');
			editProfileModal.addEventListener("hidden.bs.modal", () => this.clearEditProfileFields());
		},
	},

	computed: {
		searchbarPlaceholder(){
			let placeholder = "Search by ";

			switch (this.selectedSearchBy){
				case "id": placeholder = placeholder.concat("ID..."); break;
				case "username": placeholder = placeholder.concat("username..."); break;
				case "email": placeholder = placeholder.concat("email..."); break;
			}

			return placeholder;
		},

		searchObj(){
			let searchObj = {};

			searchObj.id = "";
			searchObj.username = "";
			searchObj.email = "";

			searchObj[this.selectedSearchBy] = this.searchTerm;

			return searchObj;
		},

		allEditProfileErrors(){
			let allErrors = [];
			allErrors.push(...this.editProfileErrors);
			allErrors.push(...this.uploadPfpErrors);
			return allErrors;
		},

		checkEditProfileInput(){
			let errors = [];

			if(!this.editProfileInputs.username.trim() || !this.editProfileInputs.email.trim()){
				errors.push("Please fill in the username field.");
			}

			if(this.editProfileInputs.username.trim().length > 100) {
				errors.push("Username can't be longer than 100 characters.");
			}

			if(this.editProfileInputs.email?.trim().length > 100) {
				errors.push("Email can't be longer than 100 characters.");
			}

			if(this.editProfileInputs.email?.trim() &&
				!this.editProfileInputs.email?.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
				errors.push("Invalid email.");
			}

			if(this.editProfileInputs.firstname?.trim().length > 100){
				errors.push("First name can't be longer than 100 characters.");
			}

			if(this.editProfileInputs.lastname?.trim().length > 100){
				errors.push("Last name can't be longer than 100 characters.");
			}

			return errors;
		},
	},

	watch: {
		'selectedSortType'(){
			this.initUsers(this.currentPage);
		}
	},

	mounted() {
		this.initUsersCount();
		this.initUsers(1);
		this.setModalHandlers();
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 60px auto 140px auto;
		font-family: Gotu, serif;
		display: flex;

		.admin-navbar-container {
			width: 20%;
		}

		.main-container {
			width: 76%;
			margin-left: 4%;

			.filters-container {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 15px;

				.left, .right {
					display: flex;
					gap: 20px;

					.search-by-multiselect {
						width: 160px;
						border-radius: 10px;
					}

					.searchbar {
						width: 300px;
						border-left: solid 1px var(--lightgrey);
						border-top: solid 1px var(--lightgrey);
						border-bottom: solid 1px var(--lightgrey);
						border-right: none;
						border-top-left-radius: 10px;
						border-bottom-left-radius: 10px;
						padding-left: 20px;
						padding-right: 20px;

						&:focus {
							outline: none;
						}

					}

					.search-button {
						width: 50px;
						height: 3rem;
						border-left: none;
						border-radius: 0 10px 10px 0;
						border-right: solid 1px var(--lightgrey);
						border-top: solid 1px var(--lightgrey);
						border-bottom: solid 1px var(--lightgrey);
						background-color: var(--yellow);

						display: flex;
						align-items: center;
						justify-content: center;

						margin-left: -20px;

						&:hover {
							box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.1);
						}

						.search-icon{
							width: 20px;
						}
					}

					.sort-label {
						white-space: nowrap;
					}

					.sort-input {
						width: 180px;
						border-radius: 10px;
					}
				}

				.right {
					align-items: center;
				}
			}

			.users-table-container {

				.users-table {
					width: 100%;

					.header-row {
						background-color: var(--darkgreen);

						.first-header {
							border-top-left-radius: 10px;
						}

						.last-header {
							border-top-right-radius: 10px;
						}

						&:hover {
							background-color: var(--darkgreen);
						}
					}

					td {
						border-top: solid 1px var(--verylightgrey);
						border-bottom: solid 1px var(--verylightgrey);
						border-collapse: collapse;

					}

					th, td {
						padding: 15px 10px;
					}

					tr {
						&:hover {
							background-color: var(--verylightgrey);

							.options-icon {
								display: block;
							}
						}
					}

					.options-icon-cell {
						width: 40px;

						.options-icon {
							width: 20px;
							display: none;

							&:hover {
								cursor: pointer;
								opacity: 0.8;
							}
						}

						.options-dropdown {
							background-color: var(--lightgreen);
							padding: 20px;
							border-radius: 20px;
							border-color: transparent;
							box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
							-webkit-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);
							-moz-box-shadow: 6px 6px 4px 0 rgba(0,0,0,0.23);

							.icon {
								height: 1.3rem;
								margin-right: 5%;
							}

							.dropdown-item{
								margin-bottom: 5%;
								border-radius: 10px;
								padding: 5px 30px 5px 25px;

								&:hover {
									background-color: var(--darkgreen);
									cursor: pointer;
								}

								&:active {
									color: black;
								}

								&:last-child {
									margin-bottom: 0;
								}
							}
						}

						.dropdown-menu::before {
							border-bottom: 12px solid rgba(0, 0, 0, 0.2);
							border-left: 12px solid rgba(0, 0, 0, 0);
							border-right: 12px solid rgba(0, 0, 0, 0);
							content: "";
							display: inline-block;
							left: 218px;
							position: absolute;
							top: -10px;
						}
						.dropdown-menu::after {
							border-bottom: 12px solid var(--lightgreen);
							border-left: 12px solid rgba(0, 0, 0, 0);
							border-right: 12px solid rgba(0, 0, 0, 0);
							content: "";
							display: inline-block;
							left: 218px;
							position: absolute;
							top: -10px;
						}
					}

					.admin-badge, .verified-badge, .unverified-badge {
						//width: 50%;
						padding: 5px 0;

						span {
							display: block;
							text-align: center;
						}
					}

					.admin-badge {
						background-color: #FFBEC6;
					}

					.verified-badge {
						background-color: #C6FDB2;
					}

					.unverified-badge {
						background-color: #FFE9AD;
					}
				}
			}

			.pagination-container {
				display: flex;
				justify-content: center;
				margin-top: 30px;
			}
		}
	}

	.modal {
		font-family: Gotu, serif;
		margin-top: 70px;

		.modal-header {
			border-bottom: none;

			.warning-icon {
				height: 40px;
				margin-top: -50px;
				margin-left: -27px;
				z-index: 1100;
			}
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

			.edit-profile-inputs {
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

				#pfp-input {
					display: none;
				}


				.pfp-upload-container {
					display: flex;
					align-items: center;
					justify-content: space-evenly;
					margin-bottom: 15px;

					.pfp-preview-container {
						display: flex;
						justify-content: center;
						align-items: center;

						width: 90px;
						height: 90px;

						background-color: white;
						border-radius: 100px;

						.pfp, #pfp-preview-img {
							width: 90px;
							height: 90px;

							object-fit: cover;
							border-radius: 100px;
							border: solid 3px white;
						}

						#pfp-preview-img {
							display: none;
						}
					}

					.buttons-container {
						width: 50%;

						.upload-btn {
							display: block;
							background-color: var(--lightgreen);
							width: 100%;
							text-align: center;
							border-radius: 15px;
							border: solid 1px var(--lightgrey);
							margin-bottom: 10px;

							&:hover {
								cursor: pointer;
								opacity: 0.7;
							}
						}

						.remove-pfp-btn {
							background-color: var(--lightgreen);
							width: 100%;
							text-align: center;
							border-radius: 15px;
							border: solid 1px var(--lightgrey);

							&:hover {
								cursor: pointer;
								opacity: 0.7;
							}
						}
					}
				}
			}

			.edit-profile-button-container {
				width: 100%;
				display: flex;
				flex-direction: row;
				justify-content: center;
				margin-top: 5%;

				.edit-profile-button {
					border: 1px solid var(--lightgrey);
					border-radius: 20px;
					background-color: var(--yellow);
					padding: 5px 30px;

					&:hover {
						opacity: 0.8;
					}
				}

				.loader {
					height: 30px;
					width: 30px;
					margin-left: 10px;
				}
			}

			.warning {
				font-size: 13px;
				text-align: left;
				display: flex;
				justify-content: center;
				align-items: center;
				gap: 15px;
				margin-top: 20px;
				font-weight: bold;
			}

			.warning-text {
				color: var(--warning);
				text-align: left;
			}

			.warning-icon {
				height: 40px;
			}
		}

		.alert {
			width: 100%;

			.edit-profile-error-items, .change-password-error-items {
				font-size: 0.8rem;
			}

			&.edit-profile-alert, &.change-password-alert {
				padding-bottom: 5px;
			}
		}
	}

	@media screen and (max-width: 1580px) {
		.filters-container {
			flex-direction: column;
			gap: 10px;

			.left, .right {
				width: 100%;

				.search-by-multiselect, .sort-input {
					margin: 0;
				}
			}
		}
	}
</style>