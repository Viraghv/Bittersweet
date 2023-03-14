<!-- Favourites page with All Favourites tab and Groups tab -->

<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<h1 class="title-text">Favourites</h1>
		<div class="tab-buttons-container">
			<div class="all-tab-button" :class="allPageSelected ? 'selected' : ''" @click="selectAllPage">
				<span>All ({{favouritesCount}})</span>
			</div>
			<div class="groups-tab-button" :class="!allPageSelected ? 'selected' : ''" @click="selectGroupsPage">
				<span>Groups</span>
			</div>
		</div>
		<div class="all-tab" v-if="allPageSelected">
			<div class="all-sort-container">
				<label class="all-sort-label" for="all-sort-input">Sort by:</label>
				<Multiselect class="all-sort-input" name="all-sort-input" v-model="selectedSortTypeAll" :options="sortTypesAll" :searchable="false" :can-clear="false" :can-deselect="false"/>
			</div>
			<div class="all-recipecards-container">
				<div class="all-recipecard-container" v-for="(recipe, index) in allFavourites" :key="index">
					<MinimalRecipeCard
						:id="recipe.id"
						:name="recipe.name"
						:uploaded="recipe.uploaded"
						:photo="recipe.photoImage"
						:photo-ext="recipe.photoExt"
						page="allFavourites"
						@add="openAddToGroupModal"
						@delete="openDeleteFavouriteModal"
					/>
				</div>
				<span class="no-recipe-text" v-show="favouritesCount === 0">There are no recipes favourited.</span>
			</div>
			<div class="all-pagination-container">
				<Pagination :total-items="favouritesCount" :items-per-page="10" :white="true" @change-page="initAllFavourites"/>
			</div>
		</div>
		<div class="groups-tab" v-else>
			<div class="groups-header">
				<div class="groups-header-left">
					<Multiselect class="group-select-input" ref="group-select-input" v-model="selectedUserGroup" :options="userGroups" :searchable="false" :can-clear="false" :can-deselect="false"/>
					<img class="edit-group-icon" src="@/assets/icons/edit_grey.png" alt="edit" @click="setNewGroupNameToCurrentName"
						 v-show="selectedUserGroup"
						 data-bs-toggle="modal"
						 data-bs-target="#edit-group-modal">
					<img class="delete-group-icon" src="@/assets/icons/bin_grey.png" alt="delete"
						 v-show="selectedUserGroup"
						 data-bs-toggle="modal"
						 data-bs-target="#delete-group-modal">
				</div>
				<div class="groups-header-right">
					<div class="group-sort-container">
						<label class="group-sort-label" for="group-sort-input">Sort by:</label>
						<Multiselect class="group-sort-input" name="group-sort-input" v-model="selectedSortTypeGroups" :options="sortTypesGroups" :searchable="false" :can-clear="false" :can-deselect="false"/>
					</div>
					<button class="create-group-button" type="button"
							data-bs-toggle="modal"
							data-bs-target="#create-group-modal">
						Create group
					</button>
				</div>
			</div>
			<div class="group-recipecards-container">
				<div class="group-recipecard-container" v-for="(recipe, index) in groupRecipes" :key="index">
					<MinimalRecipeCard
						:id="recipe.id"
						:name="recipe.name"
						:uploaded="recipe.uploaded"
						:photo="recipe.photoImage"
						:photo-ext="recipe.photoExt"
						page="groups"
						@delete="openDeleteRecipeFromGroupModal"
					/>
				</div>
				<span class="no-groups-text" v-if="Object.keys(userGroups).length === 0">You have no groups created yet.</span>
				<span class="no-recipe-text" v-else-if="groupRecipeCount === 0">There are no recipes in this group.</span>
			</div>
			<div class="group-pagination-container">
				<Pagination :total-items="groupRecipeCount" :items-per-page="10" :white="true" @change-page="initGroupRecipes"/>
			</div>
		</div>
	</div>

	<div class="modal fade" id="add-to-group-modal" ref="add-to-group-modal">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button id="add-to-group-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-to-group">
					<label class="add-to-group-label" for="add-to-group">Select group:</label><br/>
					<div class="add-to-group-form">
						<Multiselect class="add-to-group-input" name="add-to-group" v-model="allFavouritesSelectedGroup" :options="allFavouritesSelectableGroups" :searchable="true" :can-clear="false"/>
						<button class="add-to-group-button" type="button" @click="addToGroup">Add</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="remove-favourite-modal" ref="remove-favourite-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="remove-favourite-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="remove-favourite">
					<span>Are you sure you want to delete this recipe from your favourites?</span><br>
					<button class="delete-btn" @click="removeFromFavourites">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="remove-recipe-from-group-modal" ref="remove-recipe-from-group-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="remove-recipe-from-group-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="remove-recipe-from-group">
					<span>Are you sure you want to delete this recipe from the group?</span><br>
					<button class="delete-btn" @click="removeRecipeFromGroup">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="create-group-modal" ref="create-group-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="create-group-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="create-group">
					<label class="create-group-label" for="create-group">Group name:</label>
					<div class="create-group-form">
						<input class="create-group-input" name="create-group" v-model="newGroupName"/>

						<div class="create-group-alert alert alert-danger" v-if="newGroupErrors.length !== 0">
							<strong>Upload failed!</strong><br>
							<ul>
								<li class="create-group-error-items" v-for="(error, index) in newGroupErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="create-group-button" type="button" @click="createGroup">Create group</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-group-modal" ref="edit-group-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-group-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="edit-group">
					<label class="edit-group-label" for="edit-group">Group name:</label>
					<div class="edit-group-form">
						<input class="edit-group-input" name="edit-group" v-model="newGroupName"/>

						<div class="edit-group-alert alert alert-danger" v-if="newGroupErrors.length !== 0">
							<strong>Edit failed!</strong><br>
							<ul>
								<li class="edit-group-error-items" v-for="(error, index) in newGroupErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="edit-group-button" type="button" @click="editGroup">Rename group</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-group-modal" ref="delete-group-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-group-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-group">
					<span>Are you sure you want to delete this group?</span><br>
					<button class="delete-btn" @click="deleteGroup">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>

</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInNavGuard.js";
import Multiselect from '@vueform/multiselect';
import Pagination from "@/components/Pagination.vue";
import MinimalRecipeCard from "@/components/MinimalRecipeCard.vue";
import {Modal} from "bootstrap";

export default {
	name: "Favourites",
	beforeRouteEnter,

	components: {
		MinimalRecipeCard,
		Multiselect,
		Pagination,
	},

	data() {
		return {
			allPageSelected: true,
			favouritesCount: 0,

			selectedSortTypeAll: "addedToFavouritesDesc",
			sortTypesAll: {
				addedToFavouritesAsc: "Added to favourites &#8593",
				addedToFavouritesDesc: "Added to favourites &#8595",
				nameAsc: "Name &#8593",
				nameDesc: "Name &#8595",
				uploadedAsc: "Uploaded &#8593",
				uploadedDesc: "Uploaded &#8595",
			},

			selectedSortTypeGroups: "addedToGroupDesc",
			sortTypesGroups: {
				addedToGroupAsc: "Added to group &#8593",
				addedToGroupDesc: "Added to group &#8595",
				nameAsc: "Name &#8593",
				nameDesc: "Name &#8595",
				uploadedAsc: "Uploaded &#8593",
				uploadedDesc: "Uploaded &#8595",
			},

			allFavourites: [],
			allCurrentPage: 1,

			userGroups: {},
			selectedUserGroup: null,

			groupRecipes: [],
			groupCurrentPage: 1,
			groupRecipeCount: 0,

			newGroupName: "",
			newGroupErrors: [],

			groupDeleteRecipeId: null,

			allFavouritesSelectableGroups: {},
			allFavouritesSelectedGroup: null,

			allFavouritesDeleteId: null,
			allFavouritesAddToGroupRecipeId: null,

		}
	},

	methods: {
		/**
		 * Show all favourites page.
		 */
		selectAllPage(){
			this.allPageSelected = true;
			this.initAllFavourites(1);
		},

		/**
		 * Show groups page.
		 */
		selectGroupsPage(){
			this.allPageSelected = false;
			this.initGroupRecipes(1);
		},

		/**
		 * Initialize the number of user's all favourite recipes.
		 */
		async initFavouriteCount(){
			try {
				const response = await this.axios.get(`/favourite/allUserFavouriteCount`)
				this.favouritesCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initialize current page of user's favourites recipe list.
		 * @param page page to get
		 */
		async initAllFavourites(page){
			window.scrollTo(0,0);

			try {
				const response = await this.axios.get(`/favourite/allUserFavouriteCards/${this.selectedSortTypeAll}/${page}`)
				this.allFavourites = response.data;
				this.allCurrentPage = page;

				// get recipe images
				for (let i = 0; i < this.allFavourites.length; i++) {
					if(this.allFavourites[i].photo && this.allFavourites[i].photo !== "default"){
						try {
							const response = await this.axios.get(`/recipe/recipeImage/${this.allFavourites[i].photo}`);
							this.allFavourites[i].photoImage = response.data;
							this.allFavourites[i].photoExt = this.allFavourites[i].photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initialize groups of current user that recipe is not in yet.
		 */
		async initSelectableGroups(){
			try {

				const allUserGroups = await this.axios.get(`/favourite/groups/allCurrentUser`)
				for(const group of allUserGroups.data){
					this.allFavouritesSelectableGroups[group.id] = group.name;
				}

				// subtract groups recipe is already in from all of user's groups
				const groupsOfFavourite = await this.axios.get(`/favourite/groups/allGroupsOfFavourite/${this.allFavouritesAddToGroupRecipeId}`)
				for (const groupId in this.allFavouritesSelectableGroups) {
					for (let i = 0; i < groupsOfFavourite.data.length; i++) {
						if(Number(groupId) === Number(groupsOfFavourite.data[i].id)) {
							delete this.allFavouritesSelectableGroups[groupId];
						}
					}
				}
			} catch (error) {
				console.log(error);
			}
		},

		/**
		 * Initializes all groups of user, and selects the first one if parameter is set to true.
		 * @param selectFirstGroup true if first group should be selected
		 */
		async initUserGroups(selectFirstGroup=true){
			try {
				this.userGroups = {};

				const response = await this.axios.get("/favourite/groups/allCurrentUser");
				for(const group of response.data){
					this.userGroups[group.id] = group.name;
				}

				// select first group
				if(selectFirstGroup && Object.keys(this.userGroups).length > 0){
					this.selectedUserGroup = response.data[0].id;
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initializes recipe count of the currently selected group.
		 */
		async initGroupRecipeCount(){
			try {
				const response = await this.axios.get(`/favourite/groups/recipeCount/${Number(this.selectedUserGroup)}`);
				this.groupRecipeCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initializes recipes of the currently selected group by page, sorted by the currently selected sort type.
		 * @param page page to get
		 */
		async initGroupRecipes(page){
			window.scrollTo(0,0);

			try {
				const response = await this.axios.get(`/favourite/groups/getAllRecipeCards/${this.selectedSortTypeGroups}/${Number(this.selectedUserGroup)}/${page}`)
				this.groupRecipes = response.data;
				this.groupCurrentPage = page;

				// get recipe images
				for (let i = 0; i < this.groupRecipes.length; i++) {
					if(this.groupRecipes[i].photo && this.groupRecipes[i].photo !== "default"){
						try {
							const response = await this.axios.get(`/recipe/recipeImage/${this.groupRecipes[i].photo}`);
							this.groupRecipes[i].photoImage = response.data;
							this.groupRecipes[i].photoExt = this.groupRecipes[i].photo.split(".")[1];
						} catch (error) {
							console.log(error.response.data);
						}
					}
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Adds the selected recipe to the selected group.
		 */
		async addToGroup(){
			if(this.allFavouritesSelectedGroup) {
				try {
					await this.axios.post("/favourite/groups/addRecipe", {
						groupId: Number(this.allFavouritesSelectedGroup),
						recipeId: Number(this.allFavouritesAddToGroupRecipeId),
					});

					document.getElementById("add-to-group-close-button").click();
					this.allFavouritesSelectedGroup = null;

					await this.initGroupRecipeCount()
					await this.initGroupRecipes(this.groupCurrentPage);

				} catch (error) {
					console.log(error.response.data);
				}
			}
		},

		/**
		 * Deletes selected recipe from user's favourites.
		 * @returns {Promise<void>}
		 */
		async removeFromFavourites(){
			try {
				await this.axios.get(`/favourite/delete/${this.allFavouritesDeleteId}`);
				document.getElementById("remove-favourite-close-button").click();
				await this.initFavouriteCount();
				await this.initAllFavourites(this.allCurrentPage);
				this.allFavouritesDeleteId = null;

				// check if after delete the current page still exists, if not, navigate to previous one
				if(!this.currentAllPageExists){
					this.allCurrentPage--;

					let paginateButtons = document.getElementsByClassName("paginate-buttons");

					for (let i = 0; i < paginateButtons.length; i++) {
						if(paginateButtons[i].innerHTML === String(this.allCurrentPage)){
							paginateButtons[i].click();
						}
					}
				}

				await this.initGroupRecipeCount()
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Removes recipe from the currently selected group.
		 */
		async removeRecipeFromGroup(){
			try {
				await this.axios.post(`/favourite/groups/deleteRecipe`, {
					groupId: this.selectedUserGroup,
					recipeId: this.groupDeleteRecipeId,
				});
				document.getElementById("remove-recipe-from-group-close-button").click();

				await this.initGroupRecipeCount()
				// check if after delete the current page still exists, if not, navigate to previous one
				if(!this.currentGroupPageExists){
					this.groupCurrentPage--;

					let paginateButtons = document.getElementsByClassName("paginate-buttons");

					for (let i = 0; i < paginateButtons.length; i++) {
						if(paginateButtons[i].innerHTML === String(this.groupCurrentPage)){
							paginateButtons[i].click();
						}
					}
				}

				await this.initGroupRecipes(Math.max(this.groupCurrentPage, 1));
				this.groupDeleteRecipeId = null;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Creates a new group for current user.
		 */
		async createGroup(){
			// validate group name
			this.newGroupErrors = this.groupInputsValid;

			if(this.newGroupErrors.length === 0){
				try {
					const response = await this.axios.post(`/favourite/groups/create`, {
						name: this.newGroupName,
					});

					document.getElementById("create-group-close-button").click();

					await this.initUserGroups();
					// select newly created group
					this.$refs["group-select-input"].select(response.data.id);

					await this.initGroupRecipeCount();
					await this.initGroupRecipes(1);
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newGroupErrors.push(...error.response.data.errorMessage);
					} else {
						this.newGroupErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		/**
		 * Edits name of currently selected group.
		 */
		async editGroup(){
			// validate group name
			this.newGroupErrors = this.groupInputsValid;

			if(this.newGroupErrors.length === 0){
				try {
					await this.axios.post(`/favourite/groups/edit/${this.selectedUserGroup}`, {
						newName: this.newGroupName,
					});

					document.getElementById("edit-group-close-button").click();

					let prevSelectedUserGroup = this.selectedUserGroup;
					await this.initUserGroups(false);
					this.$refs["group-select-input"].select(prevSelectedUserGroup);

					await this.initGroupRecipeCount();
					await this.initGroupRecipes(this.groupCurrentPage);
					this.newGroupName = "";
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newGroupErrors.push(...error.response.data.errorMessage);
					} else {
						this.newGroupErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		/**
		 * Deletes currently selected group.
		 */
		async deleteGroup(){
			try {
				await this.axios.get(`/favourite/groups/delete/${Number(this.selectedUserGroup)}`);

				document.getElementById("delete-group-close-button").click();

				await this.initUserGroups();

				if(Object.keys(this.userGroups).length === 0){
					this.selectedUserGroup = null;
				}

				if(this.selectedUserGroup){
					await this.initGroupRecipeCount();
					await this.initGroupRecipes(1);
				}
			} catch (error) {
				console.log(error.response.data);
			}
		},

		openDeleteFavouriteModal(recipeId){
			let deleteFavouriteModal = new Modal(document.getElementById("remove-favourite-modal"), {});
			deleteFavouriteModal.show();

			this.allFavouritesDeleteId = recipeId;
		},

		openAddToGroupModal(recipeId){
			let addToGroupModal = new Modal(document.getElementById("add-to-group-modal"), {});
			addToGroupModal.show();

			this.allFavouritesAddToGroupRecipeId = recipeId;
			this.initSelectableGroups();
		},

		openDeleteRecipeFromGroupModal(recipeId){
			let deleteRecipeFromGroupModal = new Modal(document.getElementById("remove-recipe-from-group-modal"), {});
			deleteRecipeFromGroupModal.show();

			this.groupDeleteRecipeId = recipeId;
		},

		setNewGroupNameToCurrentName(){
			this.newGroupName = this.userGroups[this.selectedUserGroup];
		},

		clearNewGroupName(){
			this.newGroupName = "";
		},

		clearAddToGroupModal(){
			this.allFavouritesSelectedGroup = "";
		},

		/**
		 * Add modal clearing functions to the modal closing events.
		 */
		setModalHandlers() {
			const createGroupModal = document.getElementById('create-group-modal');
			createGroupModal.addEventListener("hidden.bs.modal", () => this.clearNewGroupName());

			const editGroupModal = document.getElementById('edit-group-modal');
			editGroupModal.addEventListener("hidden.bs.modal", () => this.clearNewGroupName());

			const addToGroupModal = document.getElementById('add-to-group-modal');
			addToGroupModal.addEventListener("hidden.bs.modal", () => this.clearAddToGroupModal());
		},
	},

	computed: {
		/**
		 * Does the current page on the all favourites tab exists based on the recipe count and page size.
		 * @returns true if page exists
		 */
		currentAllPageExists(){
			let lastPage = Math.ceil(this.favouritesCount / 10)

			return this.allCurrentPage <= lastPage;
		},

		/**
		 * Does the current page on the groups tab exists based on the recipe count and page size.
		 * @returns true if page exists
		 */
		currentGroupPageExists(){
			let lastPage = Math.ceil(this.groupRecipeCount / 10)

			return this.groupCurrentPage <= lastPage;
		},

		/**
		 * Validates group name inputs.
		 */
		groupInputsValid(){
			let errors = [];

			// is group name field filled
			if(this.newGroupName.trim() === ""){
				errors.push("Please provide a name for the group.");

			}

			// is group name longer than 100 characters
			if(this.newGroupName.trim().length > 100){
				errors.push("Group name can't be longer than 100 characters.");
			}

			return errors;
		},
	},

	watch : {
		'selectedSortTypeAll'() {
			this.initAllFavourites(this.allCurrentPage);
		},

		'selectedSortTypeGroups'(){
			this.initGroupRecipes(this.groupCurrentPage);
		},

		'selectedUserGroup'(){
			this.initGroupRecipeCount()
			this.initGroupRecipes(1);
		},
	},

	mounted() {
		this.setModalHandlers();

		this.initFavouriteCount();
		this.initAllFavourites(1);

		this.initUserGroups();
		this.initGroupRecipeCount();
		this.initGroupRecipes(1);
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 80px auto 140px auto;
		font-family: Gotu, serif;

		.title-text {
			font-size: 2rem;
		}

		.tab-buttons-container {
			display: flex;
			gap: 20px;
			margin-top: 50px;

			.all-tab-button, .groups-tab-button {
				display: flex;
				justify-content: center;
				background-color: var(--darkgreen);
				padding-top: 9px;
				padding-bottom: 7px;
				width: 150px;
				border-top-left-radius: 10px;
				border-top-right-radius: 10px;

				&:hover {
					cursor: pointer;
				}

				&.selected {
					background-color: var(--lightgreen);
				}
			}
		}

		.all-tab, .groups-tab {
			background-color: var(--lightgreen);
			border-top-right-radius: 20px;
			border-bottom-left-radius: 20px;
			border-bottom-right-radius: 20px;
		}

		.all-tab, .groups-tab {
			padding: 30px 5% 40px;

			.all-sort-container, .group-sort-container {
				display: flex;
				align-items: center;
				justify-content: right;
				margin-bottom: 40px;

				.all-sort-input, .group-sort-input {
					width: 260px;
					margin: 0 0 0 15px;
				}
			}

			.all-recipecards-container, .group-recipecards-container {

				.all-recipecard-container, .group-recipecard-container {
					margin-bottom: 15px;
				}

				.no-recipe-text, .no-groups-text {
					display: block;
					text-align: center;
					color: var(--mediumgrey);
				}
			}

			.all-pagination-container, .group-pagination-container {
				display: flex;
				justify-content: center;
				margin-top: 70px;
			}
		}
	}

	.groups-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 40px;

		.groups-header-left{
			display: flex;
			align-items: center;

			.group-select-input {
				width: 270px;
				margin: 0;
			}

			.edit-group-icon, .delete-group-icon {
				width: 20px;
				display: block;
				margin-left: 15px;

				&:hover {
					cursor: pointer;
				}
			}
		}

		.groups-header-right{
			display: flex;
			align-items: center;
			justify-content: right;
			width: 50%;

			.group-sort-container {
				margin-bottom: 0;

				.group-sort-label {
					display: block;
					white-space: nowrap;
				}
			}

			.create-group-button {
				background-color: var(--yellow);
				border: 1px solid var(--lightgrey);
				border-radius: 20px;
				padding: 3px 0;
				width: 150px;
				margin-left: 20px;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}

	.modal {
		margin-top: 70px;
	}

	.modal-header {
		border-bottom: none;

		.warning-icon {
			height: 40px;
			margin-top: -50px;
			margin-left: -27px;
			z-index: 1100;
		}
	}

	.add-to-group {
		margin: 0 10% 40px 10%;
		font-family: Gotu, serif;

		.add-to-group-label {
			margin-bottom: 10px;
		}

		.add-to-group-form {
			display: flex;
			align-items: center;

			.add-to-group-input {
				margin: 0;
				border-radius: 10px;
				border-color: transparent;
				min-height: 0;
				height: 2rem;
				padding: 15px 9px;

				&:focus {
					outline: var(--lightgreen) solid 3px;
				}
			}

			.add-to-group-button {
				background-color: var(--yellow);
				border: 1px solid var(--lightgrey);
				border-radius: 20px;
				padding: 3px 0;
				width: 25%;
				margin-left: 20px;

				&:hover {
					opacity: 0.8;
				}
			}
		}
	}

	.remove-favourite, .remove-recipe-from-group, .delete-group, .edit-group, .create-group {
		margin: 0 10% 30px 10%;
		font-family: Gotu, serif;
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

	.edit-group, .create-group {
		text-align: left;
		display: flex;
		flex-direction: column;

		.edit-group-form, .create-group-form{
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.edit-group-input, .create-group-input {
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

		.edit-group-button, .create-group-button {
			border: 1px solid var(--lightgrey);
			border-radius: 20px;
			padding: 5px 30px;
			margin-top: 15px;
			background-color: var(--yellow);

			&:hover {
				opacity: 0.8;
			}
		}
	}

	.alert {
		width: 100%;

		.create-group-error-items, .edit-group-error-items {
			font-size: 0.8rem;
		}

		&.create-group-alert, &.edit-group-alert {
			padding-bottom: 5px;
		}
	}

	@media screen and (max-width: 1725px) {
		.groups-header {
			display: flex;
			flex-direction: column;
			justify-content: left;

			.groups-header-left, .groups-header-right{
				width: 100%;
				justify-content: left;
			}

			.groups-header-left {
				margin-bottom: 20px;
			}
		}
	}

	@media screen and (max-width: 575px){
		.content {
			margin-left: 10px;
			margin-right: 10px;
		}

		.all-sort-container, .group-sort-container {
			flex-direction: column;
			align-items: flex-start !important;

			.all-sort-input, .group-sort-input {
				margin-left: 0 !important;
			}
		}

		.groups-header-right {
			flex-direction: column;
			align-items: flex-start !important;

			.create-group-button {
				margin-left: 0 !important;
				margin-top: 10px;
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