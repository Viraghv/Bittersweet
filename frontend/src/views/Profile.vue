<!-- Profile page of user -->

<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="profile-container">
			<div class="user-info">
				<div class="column-left">
					<div class="user-card">
						<div class="pfp-container">
							<img class="pfp" :src="'data:image/' + userStore.user.pfpExt + ';base64,'+ userStore.user.pfp" alt="pfp" v-if="userStore.user && userStore.user.profilepicture" />
							<img class="pfp" src="/src/assets/default_pfp.png" alt="pfp" v-else>
						</div>
						<div class="user">
							<span class="username" v-show="userStore.user?.username">{{userStore.user?.username.length < 10 ? userStore.user?.username : userStore.user?.username.substring(0, 10) + '...' }}</span><br>
							<div class="recipe-count"> Recipes: {{recipeCount}}</div>
						</div>
					</div>
				</div>
				<div class="column-right">
					<table class="user-info-table">
						<tr>
							<th>First name:</th>
							<td class="first-name-td">{{userStore.user?.firstname ? userStore.user?.firstname : "-"}}</td>
						</tr>
						<tr>
							<th>Last name:</th>
							<td  class="last-name-td">{{userStore.user?.lastname ? userStore.user?.lastname : "-"}}</td>
						</tr>
						<tr>
							<th>Email:</th>
							<td class="email-td">{{userStore.user?.email}}</td>
						</tr>
						<tr>
							<th>Member since:</th>
							<td class="member-since-td">{{formattedMemberSinceDate}}</td>
						</tr>
					</table>
				</div>
			</div>
			<div class="buttons-container">
				<button class="change-password-btn" type="button"
						data-bs-toggle="modal"
						data-bs-target="#change-password-modal">
					Change password</button>
				<button class="edit-profile-btn" type="button"
						@click="initEditProfileModal"
						data-bs-toggle="modal"
						data-bs-target="#edit-profile-modal">
					Edit profile</button>
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
					<span>Diet:
						<b>{{userStore.user?.diet?.name ? userStore.user?.diet?.name : "-"}}</b>
					</span>
					<span>Max. recipe difficulty:
						<b>{{userStore.user?.difficultyPref?.name ? userStore.user?.difficultyPref?.name : "-"}}</b>
					</span>
					<span>Max. recipe cost:
						<b>{{userStore.user?.costPref?.name ? userStore.user?.costPref?.name : "-"}}</b>
					</span>
					<div class="buttons-container">
						<button class="edit-pref-btn" type="button"
								@click="initEditPreferencesModal"
								data-bs-toggle="modal"
								data-bs-target="#edit-preferences-modal"
						>Edit preferences</button>
					</div>
				</div>
			</div>
		</div>

		<h1 class="my-recipes-title">My recipes</h1>
		<div class="my-recipes-container">
			<div class="sort-container">
				<label class="sort-label" for="sort-input">Sort by:</label>
				<Multiselect class="sort-input" name="sort-input" v-model="selectedSortType" :options="sortTypes" :searchable="false" :can-clear="false" :can-deselect="false"/>
			</div>
			<div class="my-recipecards-container">
				<div class="my-recipecard-container" v-for="(recipe, index) in myRecipes" :key="index">
					<MinimalRecipeCard
						:id="recipe.id"
						:name="recipe.name"
						:uploaded="recipe.uploaded"
						:photo="recipe.photoImage"
						:photo-ext="recipe.photoExt"
						page="profile"
						@edit="navigateToEditRecipe"
						@delete="openDeleteRecipeModal"
					/>
				</div>
				<span class="no-recipe-text" v-show="recipeCount === 0">There are no recipes uploaded.</span>
			</div>
			<div class="pagination-container">
				<Pagination :total-items="recipeCount" :items-per-page="10" :white="true" @change-page="initMyRecipes"/>
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
								<img id="pfp-current" class="pfp" :src="'data:image/' + userStore.user.pfpExt + ';base64,'+ userStore.user.pfp" alt="pfp"
									 v-if="editProfileInputs.pfp === null && userStore.user && userStore.user.profilepicture && !dontShowCurrentPfp" />
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
						<button class="edit-profile-button" @click="editProfile">Edit profile</button>
						<Loader class="loader" v-if="editProfileShowLoader"/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-preferences-modal" ref="edit-preferences-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-preferences-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="modal-body edit-preferences-modal-body">
					<form class="edit-preferences-inputs">
						<div class="allergens-container">
							<label for="allergens">Allergens:</label>
							<Multiselect
								class="allergens-input"
								name="allergens"
								v-model="editPreferencesInputs.allergens"
								:options="allergenOptions"
								mode="tags"
								:close-on-select="false"
								:searchable="true"
							/>
						</div>
						<div class="diet-container">
							<label for="diet">Diet:</label>
							<Multiselect name="diet" class="diet-input"
										 v-model="editPreferencesInputs.dietId"
										 :options="dietOptions"
										 :searchable="true"
										 :can-clear="true"/>
						</div>
						<div class="difficulty-container">
							<label for="difficulty">Difficulty:</label>
							<Multiselect name="difficulty" class="difficulty-input"
										 v-model="editPreferencesInputs.difficultyId"
										 :options="difficultyOptions"
										 :searchable="true"
										 :can-clear="true"/>
						</div>
						<div class="cost-container">
							<label for="cost">Cost:</label>
							<Multiselect name="cost" class="cost-input"
										 v-model="editPreferencesInputs.costId"
										 :options="costOptions"
										 :searchable="true"
										 :can-clear="true"/>
						</div>
					</form>
					<div class="warning">
						<div class="warning-icon-container">
							<img class="warning-icon" src="@/assets/icons/warning.png" alt="warning">
						</div>
						<div class="warning-text-container">
							<span> <span class="warning-text">Warning!</span> If you save your preferences, your current weekly menu recommendations will be changed!</span>
						</div>
					</div>
					<div class="edit-preferences-button-container">
						<button class="edit-preferences-button" @click="editPreferences">Save preferences</button>
						<Loader class="loader" v-if="savePreferencesLoader"/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-recipe-modal" ref="delete-recipe-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-recipe-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-recipe">
					<span>Are you sure you want to delete this recipe?</span><br>
					<button class="delete-btn" @click="deleteRecipe">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
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
import Multiselect from '@vueform/multiselect';
import MinimalRecipeCard from "@/components/MinimalRecipeCard.vue";
import Pagination from "@/components/Pagination.vue";
import {Modal} from "bootstrap";
import Loader from "@/components/Loader.vue";

export default {
	name: "Profile",
	beforeRouteEnter,

	components: {
		Loader,
		Pagination,
		MinimalRecipeCard,
		Multiselect,
	},

	data(){
		return {
			recipeCount: 0,

			changePasswordInput: {
				currentPassword: "",
				newPassword: "",
				newPasswordAgain: "",
			},

			changePasswordErrors: [],

			editProfileInputs: {
				username: "",
				firstname: "",
				lastname: "",
				pfp: null,
				deletePfp: false,
			},

			editProfileErrors: [],
			uploadPfpErrors: [],

			editPreferencesInputs: {
				allergens: [],
				dietId: null,
				difficultyId: null,
				costId: null,
			},

			allergenOptions: {},
			dietOptions: {},
			difficultyOptions: {},
			costOptions: {},

			selectedSortType: "uploadedDesc",
			sortTypes: {
				nameAsc: "Name &#8593",
				nameDesc: "Name &#8595",
				uploadedAsc: "Uploaded &#8593",
				uploadedDesc: "Uploaded &#8595",
			},

			myRecipes: [],
			myRecipesCurrentPage: 1,

			deleteRecipeId: null,

			editProfileShowLoader: false,
			savePreferencesLoader: false,

			dontShowCurrentPfp: false,
		}
	},

	methods: {
		/**
		 * Validates uploaded profile picture and displays the preview image.
		 * @param event file upload event
		 */
		showPfpPreview(event){
			this.uploadPfpErrors = [];

			if(event.target.files.length === 0){
				return;
			}

			// if image type is not jpg or png
			if(event.target.files[0].type !== "image/jpeg" && event.target.files[0].type !== "image/png"){
				this.uploadPfpErrors.push("Incorrect file type.")
			}

			// if file is bigger than 1MB
			if(event.target.files[0].size > 1024000){
				this.uploadPfpErrors.push("File can't be bigger than 1MB.")
			}

			if(this.uploadPfpErrors.length > 0){
				return;
			}

			this.editProfileInputs.pfp = event.target.files[0];
			// display preview image
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

		/**
		 * Initializes number of user's uploaded recipes.
		 */
		async initRecipeCount(){
			try {
				const response = await axios.get(`/user/uploadedRecipeCount/${this.userStore.user.id}`);
				this.recipeCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initializes user data.
		 */
		async initUser(){
			try {
				const userResponse = await this.axios.get(`/user/getCurrentUser`);
				let user = userResponse.data;

				// get profile picture
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

		/**
		 * Initializes recipe difficulty options.
		 */
		async initDifficulties(){
			try {
				const response = await this.axios.get('/recipe/difficulties');
				for(const difficulty of response.data){
					this.difficultyOptions[difficulty.id] = difficulty.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes recipe cost options.
		 */
		async initCosts(){
			try {
				const response = await this.axios.get('/recipe/costs');
				for(const cost of response.data){
					this.costOptions[cost.id] = cost.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes allergen options.
		 */
		async initAllergens(){
			try {
				const response = await this.axios.get('/recipe/allergens');
				for(const allergen of response.data){
					this.allergenOptions[allergen.id] = allergen.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes diet options.
		 */
		async initDiets(){
			try {
				const response = await this.axios.get('/recipe/diets');
				for(const diet of response.data){
					this.dietOptions[diet.id] = diet.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes user's uploaded recipe cards of current page.
		 * @param page page to get
		 */
		async initMyRecipes(page){
			try {
				const response = await this.axios.get(`/user/currentUserAllRecipeCards/${this.selectedSortType}/${page}`)
				this.myRecipes = response.data;
				this.myRecipesCurrentPage = page;

				// get recipe images
				for (let i = 0; i < this.myRecipes.length; i++) {
					if(this.myRecipes[i].photo && this.myRecipes[i].photo !== "default"){
						try {
							const response = await this.axios.get(`/recipe/recipeImage/${this.myRecipes[i].photo}`);
							this.myRecipes[i].photoImage = response.data;
							this.myRecipes[i].photoExt = this.myRecipes[i].photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}

			} catch (error) {
				console.log(error.response.data);
			}
		},

		initEditProfileModal(){
			this.editProfileInputs.username = this.userStore.user?.username;
			this.editProfileInputs.email = this.userStore.user?.email;
			this.editProfileInputs.firstname = this.userStore.user?.firstname;
			this.editProfileInputs.lastname = this.userStore.user?.lastname;
		},

		initEditPreferencesModal(){
			this.editPreferencesInputs.allergens = [];
			for (let i = 0; i < this.userStore.user?.allergies?.length; i++) {
				this.editPreferencesInputs.allergens.push(this.userStore.user?.allergies[i].id);
			}

			this.editPreferencesInputs.dietId = this.userStore.user?.diet?.id;
			this.editPreferencesInputs.difficultyId = this.userStore.user?.difficultyPref?.id;
			this.editPreferencesInputs.costId = this.userStore.user?.costPref?.id;
		},

		/**
		 * Changes password of user.
		 */
		async changePassword(){
			// validate password inputs
			this.changePasswordErrors = this.checkChangePasswordInput;

			if(this.changePasswordErrors.length === 0){
				try {
					await this.axios.post("/user/edit/password", {
						currentPassword: this.changePasswordInput.currentPassword.trim(),
						newPassword: this.changePasswordInput.newPassword.trim(),
					});

					document.getElementById("change-password-close-button").click();

				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.changePasswordErrors.push(...error.response.data.errorMessage);
					} else {
						this.changePasswordErrors.push(error.response.data.errorMessage);
					}
				}
			}

		},

		/**
		 * Edits profile data of user.
		 */
		async editProfile(){
			// validate comment data
			this.editProfileErrors = this.checkEditProfileInput;
			this.uploadPfpErrors = [];

			if(this.editProfileErrors.length === 0){
				this.editProfileShowLoader = true;
				try {
					// upload profile data
					await this.axios.post("/user/edit/profile", {
						username: this.editProfileInputs.username.trim(),
						firstname: this.editProfileInputs.firstname?.trim(),
						lastname: this.editProfileInputs.lastname?.trim(),
						deletePfp: this.editProfileInputs.deletePfp,
					});

					// upload profile picture
					if(this.editProfileInputs.pfp){
						const formData = new FormData();
						formData.append('image', this.editProfileInputs.pfp);

						await this.axios.post(
							`/user/edit/uploadImage`,
							formData,
							{
								headers: {
									'Content-Type': 'multipart/form-data'
								}
							}
						)
					}

					await this.initUser();

					this.editProfileShowLoader = false;
					document.getElementById("edit-profile-close-button").click();
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.editProfileErrors.push(...error.response.data.errorMessage);
					} else {
						this.editProfileErrors.push(error.response.data.errorMessage);
					}
				}
			}

		},

		/**
		 * Edits user's weekly menu preferences.
		 */
		async editPreferences(){
			this.savePreferencesLoader = true;

			try {
				for (let i = 0; i < this.editPreferencesInputs.allergens.length; i++) {
					this.editPreferencesInputs.allergens[i] = Number(this.editPreferencesInputs.allergens[i]);
				}

				await this.axios.post("/user/edit/preferences", {
					difficultyId: Number(this.editPreferencesInputs.difficultyId),
					costId: Number(this.editPreferencesInputs.costId),
					dietId: Number(this.editPreferencesInputs.dietId),
					allergies: this.editPreferencesInputs.allergens,
				});

				await this.initUser();

				this.savePreferencesLoader = false;

				document.getElementById("edit-preferences-close-button").click();

			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Deletes recipe of user.
		 */
		async deleteRecipe(){
			try {
				await this.axios.get(`/recipe/delete/${this.deleteRecipeId}`);
				document.getElementById("delete-recipe-close-button").click();
				await this.initRecipeCount();
				await this.initMyRecipes(this.myRecipesCurrentPage);

				// check if after delete the current page still exists, if not, navigate to previous one
				if(!this.currentPageExists){
					this.myRecipesCurrentPage--;

					let paginateButtons = document.getElementsByClassName("paginate-buttons");

					for (let i = 0; i < paginateButtons.length; i++) {
						if(paginateButtons[i].innerHTML === String(this.myRecipesCurrentPage)){
							paginateButtons[i].click();
						}
					}
				}

				this.deleteRecipeId = null;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Removes current profile picture from profile edit inputs and preview image.
		 */
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

		navigateToEditRecipe(recipeId){
			window.scrollTo(0, 0);
			this.$router.push({path: `/upload_recipe/${recipeId}`});
		},

		openDeleteRecipeModal(recipeId){
			let deleteRecipeModal = new Modal(document.getElementById("delete-recipe-modal"), {});
			deleteRecipeModal.show();

			this.deleteRecipeId = recipeId;
		},

		clearChangePasswordFields(){
			this.changePasswordInput.currentPassword = "";
			this.changePasswordInput.newPassword = "";
			this.changePasswordInput.newPasswordAgain = "";
			this.changePasswordErrors = [];
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

		/**
		 * Add modal clearing functions to the modal closing events.
		 */
		setModalHandlers(){
			const changePasswordModal = document.getElementById('change-password-modal');
			changePasswordModal.addEventListener("hidden.bs.modal", () => this.clearChangePasswordFields());

			const editProfileModal = document.getElementById('edit-profile-modal');
			editProfileModal.addEventListener("hidden.bs.modal", () => this.clearEditProfileFields());
		},
	},

	computed: {
		/**
		 * @returns member since date in British format
		 */
		formattedMemberSinceDate(){
			return new Date(this.userStore.user?.joined.split(" ")[0]).toLocaleDateString("en-GB");

		},

		/**
		 * Validates change password inputs.
		 * @returns array of validation error messages
		 */
		checkChangePasswordInput(){
			let errors = [];

			// are all fields filled
			if(this.changePasswordInput.currentPassword.trim() === "" || this.changePasswordInput.newPassword.trim() === "" ||
			   this.changePasswordInput.newPasswordAgain.trim() === ""){
				errors.push("Please fill in all fields.");
			}

			// is new password shorter than 6 characters
			if(this.changePasswordInput.newPassword.trim() !== "" && this.changePasswordInput.newPassword.trim().length < 6){
				errors.push("Password must be at least 6 characters long.")
			}

			// does password and password again fields match
			if(this.changePasswordInput.newPassword !== this.changePasswordInput.newPasswordAgain){
				errors.push("Passwords do not match.");
			}

			return errors;
		},

		/**
		 * Validates profile edit inputs.
		 * @returns array of validation error messages
		 */
		checkEditProfileInput(){
			let errors = [];

			// is username field filled
			if(!this.editProfileInputs.username.trim()){
				errors.push("Please fill in the username field.");
			}

			// is username longer than 100 characters
			if(this.editProfileInputs.username.trim().length > 100) {
				errors.push("Username can't be longer than 100 characters.");
			}

			// is first name longer than 100 characters
			if(this.editProfileInputs.firstname?.trim().length > 100){
				errors.push("First name can't be longer than 100 characters.");
			}

			// is last name longer than 100 characters
			if(this.editProfileInputs.lastname?.trim().length > 100){
				errors.push("Last name can't be longer than 100 characters.");
			}

			return errors;
		},

		/**
		 * Concatenates edit profile errors and profile picture upload errors.
		 * @returns all user edit errors
		 */
		allEditProfileErrors(){
			let allErrors = [];
			allErrors.push(...this.editProfileErrors);
			allErrors.push(...this.uploadPfpErrors);
			return allErrors;
		},

		/**
		 * Does the current page of the user's recipes exists based on the recipe count and page size.
		 * @returns true if page exists
		 */
		currentPageExists(){
			let lastPage = Math.ceil(this.recipeCount / 10)

			return this.myRecipesCurrentPage <= lastPage;
		},

		...mapStores(useUserStore),
	},

	watch: {
		'userStore.user'(){
			if(this.userStore.user){
				this.initRecipeCount();
			}
		},

		'selectedSortType'() {
			this.initMyRecipes(this.myRecipesCurrentPage);
		},

		},

	mounted() {
		this.setModalHandlers();

		if(this.userStore.user){
			this.initRecipeCount();
		}

		this.initMyRecipes(1);

		this.initAllergens();
		this.initDiets();
		this.initDifficulties();
		this.initCosts();
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
			margin-bottom: 80px;

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

							width: 180px;
							height: 180px;

							background-color: white;
							border-radius: 100px;

							.pfp {
								width: 180px;
								height: 180px;

								object-fit: cover;
								border-radius: 100px;
								border: solid 5px white;
							}
						}
					}

					.user {
						margin-left: 25px;

						.username {
							font-size: 1.5rem;
						}

						.recipe-count {
							font-size: 0.8rem;
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

							.email-td, .first-name-td, .last-name-td {
								word-break: break-all;
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

		.my-recipes-title {
			font-size: 2rem;
			margin-bottom: 20px;
		}

		.my-recipes-container {
			background-color: var(--lightgreen);
			border-radius: 20px;
			padding: 30px 5% 40px;

			.sort-container {
				display: flex;
				align-items: center;
				justify-content: right;
				margin-bottom: 40px;

				.sort-input {
					width: 250px;
					margin: 0 0 0 15px;
				}
			}

			.my-recipecards-container {

				.my-recipecard-container {
					margin-bottom: 15px;
				}

				.no-recipe-text {
					display: block;
					text-align: center;
					color: var(--mediumgrey);
				}
			}

			.pagination-container {
				display: flex;
				justify-content: center;
				margin-top: 70px;

				ul {
					margin-top: 0;
				}
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

			//.change-password-alert {
			//	padding-bottom: 5px;
			//	padding-top: 20px;
			//}

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
					gap: 10px;

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

			//.edit-profile-alert{
			//	padding-bottom: 5px;
			//	padding-top: 20px;
			//}

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

			.edit-preferences-inputs {
				display: flex;
				flex-direction: column;

				.allergens-input, .difficulty-input, .cost-input, .diet-input {
					margin-top: 1%;
					margin-bottom: 4%;
					border-radius: 10px;

					&:focus {
						outline: var(--darkestgreen) solid 3px;
					}
				}

				.difficulty-container, .cost-container, .diet-container {
					display: flex;
					align-items: center;
					justify-content: space-between;
					white-space: nowrap;

					label {
						margin-top: -10px;
						display: block;
					}

					.difficulty-input, .cost-input, .diet-input {
						width: 70%;
						margin-left: 0;
						margin-right: 0;
					}
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

			.edit-preferences-button-container {
				width: 100%;
				display: flex;
				flex-direction: row;
				justify-content: center;
				margin-top: 5%;

				.edit-preferences-button {
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



	.delete-recipe {
		margin: 0 10% 30px 10%;
		text-align: center;

		.delete-btn, .cancel-btn {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;

			&:hover {
				opacity: 0.8;
			}
		}

		.delete-btn {
			background-color: var(--yellow);
			margin-right: 40px;
		}

		.cancel-btn {
			background-color: var(--lightgreen);
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

	@media screen and (max-width: 575px){
		.content {
			margin-left: 10px;
			margin-right: 10px;
		}

		.pfp-container {
			width: 150px !important;
			height: 150px !important;

			.pfp {
				width: 150px !important;
				height: 150px !important;
			}
		}
	}

	@media screen and (max-width: 500px){
		.difficulty-container, .cost-container, .diet-container {
			flex-direction: column;
			align-items: flex-start !important;

			label {
				margin-top: 0 !important;
			}

			.difficulty-input, .cost-input, .diet-input {
				width: 100% !important;
			}
		}
	}

	@media (hover: none) {
		.modal-header {
			.warning-icon {
				display: none !important;
			}
		}

		.modal {
			margin-top: 0;
		}
	}

</style>