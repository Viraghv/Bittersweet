<!-- Shopping list page, with category and list views -->

<template>
	<div class="content col-xxl-5 col-xl-7 col-lg-9 col-md-11 col-sm-11">
		<h1 class="title-text">Shopping list</h1>
		<div class="shopping-list-header">
			<div class="delete-buttons-container">
				<button class="clear-list-button"
						data-bs-toggle="modal"
						data-bs-target="#clear-list-modal">
					Clear list
				</button>
				<button class="delete-crossed-button"
						data-bs-toggle="modal"
						data-bs-target="#delete-crossed-modal">
					Delete crossed-off items
				</button>
			</div>
			<div class="search-and-views-container">
				<input type="text" class="searchbar" v-model="itemSearchInput" placeholder="Search for item..." v-if="view === 'list'"/>
				<input type="text" class="searchbar" v-model="categorySearchInput" placeholder="Search for category..." v-if="view === 'category'"/>

				<button class="change-view-button" v-if="view === 'category'" @click="setView('list')">
					List view
				</button>
				<button class="change-view-button" v-if="view === 'list'" @click="setView('category')">
					Category view
				</button>
			</div>
		</div>


		<div class="list-view" v-if="view === 'list'">
			<div class="list-container">
				<div class="no-items-container" v-if="allShoppingListItems.length === 0">
					<span class="no-items-text">The shopping list is empty.</span>
				</div>
				<div class="list-item" v-for="(item, index) in allShoppingListItems" :key="index" v-show="itemMatch(item)">
					<input class="checkbox-input" :checked="item.done" type="checkbox" :id="'check-item' + index" :value="item" @change="setItemsDone(item.connectedItems, item.done)">
					<label :for="'check-item' + index" :class="item.done ? 'crossed' : ''">
						<span class="amount">{{item.amount ? item.amount + " " : ""}}</span>
						<span class="unit">{{item.unit ? item.unit.name + " " : ""}}</span>
						<span class="name">{{item.name}}</span>
						<span class="checked-amount" v-if="item.amount"> ({{item.checkedAmount}}/{{item.amount}})</span>
					</label>
				</div>
			</div>
		</div>

		<div class="category-view" v-if="view === 'category'">
			<div class="add-category-button"
				 data-bs-toggle="modal"
				 data-bs-target="#add-category-modal">

				<img class="add-category-icon" src="@/assets/icons/add_icon_black.png" alt="add-icon"/>
				<span class="add-category-text">Add category</span>
			</div>
			<div class="list-container">
				<div class="list-category" v-for="(category, index) in userList" :key="index" v-show="categoryMatch(category)">
					<div class="category-header">
						<span>{{category.name}}</span>
						<div class="icons-container">
							<img class="edit-icon" src="@/assets/icons/edit_grey.png" alt="edit-icon" @click="openEditCategoryModal(category.id, category.name)">
							<img class="delete-icon" src="@/assets/icons/bin_grey.png" alt="delete-icon" @click="openDeleteCategoryModal(category.id)">
						</div>
					</div>
					<div class="category-list-items">
						<div class="no-items-container" v-if="category.shoppingListItems.length === 0">
							<span class="no-items-text">This category is empty.</span>
						</div>
						<div class="category-list-item" v-for="(item, index2) in category.shoppingListItems" :key="index2">
							<input class="checkbox-input" :checked="item.done" type="checkbox" :id="'check-item' + index2" :value="item" @change="setItemDone(item)">
							<span :class="item.done ? 'crossed' : ''">
								<span class="amount">{{item.amount ? item.amount + " " : ""}}</span>
								<span class="unit">{{item.unit ? item.unit.name + " " : ""}}</span>
								<span class="name">{{item.name}}</span>
							</span>
						</div>
						<div class="new-items-container">
							<div class="new-item" v-for="(item, index) in addedNewItems[category.id]" :key="index">
								<div class="new-item-inputs-container">
									<input class="item-amount-input" type="number" placeholder="Amount" v-model="item.amount" >
									<Multiselect class="item-unit-input" v-model="item.unitId" :options="units" :searchable="true" :can-clear="false" placeholder="Unit"/>
									<input class="item-name-input" type="text" placeholder="Item name" v-model="item.name">
								</div>
								<img class="delete-item-button" src="@/assets/icons/close_grey.png" alt="delete-icon" @click="deleteItem(category.id, index)">
							</div>
							<div class="upload-alert-container">
								<div class="upload-alert alert alert-danger"
									 v-if="itemUploadErrors[category.id] ? itemUploadErrors[category.id].length !== 0 : false">
									<strong>Upload failed!</strong><br>
									<ul>
										<li class="upload-error-items" v-for="(error, index) in itemUploadErrors[category.id]" :key="index">{{error}}</li>
									</ul>
								</div>
							</div>
							<div class="add-item-btn-container">
								<button class="add-item-btn" v-if="addedNewItems[category.id]?.length > 0" @click="uploadItems(category.id)">Upload</button>
							</div>
						</div>
					</div>
					<div class="add-item-button" @click="addNewItem(category.id)">
						<img class="add-item-icon" src="@/assets/icons/add_icon_black.png" alt="add-icon"/>
						<span class="add-item-text" >Add item</span>
					</div>
				</div>
			</div>
			<div class="no-category-container">
				<span class="no-category-text" v-if="Object.keys(userList).length === 0">Your shopping list is empty.</span>
			</div>
		</div>
	</div>


	<div class="modal fade" id="add-category-modal" ref="add-category-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="add-category-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="add-category">
					<label class="add-category-label" for="add-category">Category name:</label>
					<form class="add-category-form">
						<input class="add-category-input" name="add-category" v-model="newCategoryName"/>

						<div class="add-category-alert alert alert-danger" v-if="newCategoryErrors.length !== 0">
							<strong>Upload failed!</strong><br>
							<ul>
								<li class="add-category-error-items" v-for="(error, index) in newCategoryErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="add-category-button" type="button" @click="addCategory">Add category</button><br>
					</form>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="edit-category-modal" ref="edit-category-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-category-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="edit-category">
					<label class="edit-category-label" for="edit-category">Category name:</label>
					<div class="edit-category-form">
						<input class="edit-category-input" name="edit-category" v-model="newCategoryName"/>

						<div class="edit-category-alert alert alert-danger" v-if="newCategoryErrors.length !== 0">
							<strong>Edit failed!</strong><br>
							<ul>
								<li class="edit-category-error-items" v-for="(error, index) in newCategoryErrors" :key="index">{{error}}</li>
							</ul>
						</div>

						<button class="edit-category-button" type="button" @click="editCategory">Edit category</button><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-category-modal" ref="delete-category-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-category-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-category">
					<span>Are you sure you want to delete this category?</span><br>
					<button class="delete-btn" @click="deleteCategory">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-crossed-modal" ref="delete-crossed-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-crossed-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-crossed">
					<span>Are you sure you want to delete all the crossed-out items from the shopping list?</span><br>
					<button class="delete-btn" @click="deleteCrossed">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="clear-list-modal" ref="clear-list-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="clear-list-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="clear-list">
					<span>Are you sure you want to clear your shopping list? Every category and list item will be deleted.</span><br>
					<button class="delete-btn" @click="clearList">Clear</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInNavGuard.js";
import Multiselect from '@vueform/multiselect';
import axios from "axios";
import {Modal} from "bootstrap";


export default {
	name: "ShoppingList",
	beforeRouteEnter,

	components: {
		Multiselect,
	},

	data() {
		return {
			view: "category",   // list / category

			userList: [],
			addedNewItems: {},
			itemUploadErrors: {},

			allShoppingListItems: [],

			units: {},

			newCategoryName: "",
			newCategoryErrors: [],

			editCategoryId: null,
			deleteCategoryId: null,

			categorySearchInput: "",
			itemSearchInput: "",
		}
	},

	methods: {
		/**
		 * Initializes the shopping list of current user, with the shopping list categories and the items in them.
		 */
		async initUserList() {
			try {
				const response = await this.axios.get(`/shoppingList/currentUserList`);
				this.userList = response.data;

				this.initAllShoppingListItems();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initializes the "Add new item" fields as empty.
		 */
		initAddNewItems(){
			for (let i = 0; i < this.userList.length; i++) {
				this.addedNewItems[this.userList[i].id] = [];
			}
		},

		/**
		 * Initializes unit options.
		 */
		async initUnits(){
			try {
				const response = await this.axios.get('/recipe/units');
				for(const unit of response.data){
					this.units[unit.id] = unit.name;
				}
			} catch (err) {
				console.log(err.response.data);
			}
		},

		/**
		 * Initializes shopping list of the list view, lists items in alphabetical order and merging items with the same
		 * name and unit.
		 */
		initAllShoppingListItems() {
			this.allShoppingListItems = [];

			for (let i = 0; i < this.userList.length; i++) {
				for (let j = 0; j < this.userList[i].shoppingListItems.length; j++) {
					let skip = false;
					for (let k = 0; k < this.allShoppingListItems.length; k++) {
						// if the items have the same name and unit
						if(this.userList[i].shoppingListItems[j].name.toLowerCase().trim() === this.allShoppingListItems[k].name.toLowerCase().trim() &&
						   this.userList[i].shoppingListItems[j].unit?.id === this.allShoppingListItems[k].unit?.id) {

							// add the amounts together
							this.allShoppingListItems[k].amount += Number(this.userList[i].shoppingListItems[j].amount);
							// save new list item's connections to the items that make it up
							this.allShoppingListItems[k].connectedItems.push(this.userList[i].shoppingListItems[j].id);

							// if an item connected to it is not done, then the new item is not done either
							if(this.userList[i].shoppingListItems[j].done === false) {
								this.allShoppingListItems[k].done = false;
							// if the item is done then add to the already checked amount
							} else {
								this.allShoppingListItems[k].checkedAmount += Number(this.userList[i].shoppingListItems[j].amount);
							}

							skip = true;
							break;
						}
					}

					if(skip){
						continue;
					}

					// if a matching item was not found to the current one, just add it to the new array as it is
					this.allShoppingListItems.push({
						name: this.userList[i].shoppingListItems[j].name,
						amount: Number(this.userList[i].shoppingListItems[j].amount),
						checkedAmount: this.userList[i].shoppingListItems[j].done ? Number(this.userList[i].shoppingListItems[j].amount) : 0,
						unit: this.userList[i].shoppingListItems[j].unit,
						done: this.userList[i].shoppingListItems[j].done,
						connectedItems: [this.userList[i].shoppingListItems[j].id],
					});
				}
			}

			// sort alphabetically
			this.allShoppingListItems.sort((a,b) => {
				if (a.name.toLowerCase() < b.name.toLowerCase()) {
					return -1;
				}
				if (a.name.toLowerCase() > b.name.toLowerCase()) {
					return 1;
				}
				return 0;
			});
		},

		/**
		 * Changes the 'done' status of the item to the opposite value.
		 * @param item item to change status of
		 */
		async setItemDone(item){
			try {
				await this.axios.post(`/shoppingList/edit/item/setDone/${item.id}`, {
					done: !item.done
				});

				await this.initUserList();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Changes the 'done' status of multiple items to the opposite value.
		 * @param itemIds array of itemIds to change the status of
		 * @param done current 'done' status of the summing item containing all the connected ones (in the list view)
		 */
		async setItemsDone(itemIds, done) {
			try {
				for (let i = 0; i < itemIds.length; i++) {
					await this.axios.post(`/shoppingList/edit/item/setDone/${itemIds[i]}`, {
						done: !done
					});
				}
				await this.initUserList();
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Uploads multiple new items to shopping list category.
		 * @param categoryId categoryId of category to add items to
		 */
		async uploadItems(categoryId){
			// validate item inputs
			this.itemUploadErrors[categoryId] = this.itemInputsValid(categoryId);

			if(this.itemUploadErrors[categoryId].length === 0) {
				// convert item objects to fit backend
				for (let i = 0; i < this.addedNewItems[categoryId].length; i++) {
					this.addedNewItems[categoryId][i].name = this.addedNewItems[categoryId][i].name.trim();
					this.addedNewItems[categoryId][i].unitId = Number(this.addedNewItems[categoryId][i].unitId);

					if (this.addedNewItems[categoryId][i].unitId === 0) {
						this.addedNewItems[categoryId][i].unitId = null;
					}
				}

				try {
					await this.axios.post(`/shoppingList/add/items/${categoryId}`, {
						items: this.addedNewItems[categoryId],
					});

					this.addedNewItems[categoryId] = [];
					await this.initUserList();

				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.itemUploadErrors[categoryId].push(...error.response.data.errorMessage);
					} else {
						this.itemUploadErrors[categoryId].push(error.response.data.errorMessage);
					}
				}
			}
		},

		/**
		 * Deletes all crossed off items from user's shopping list.
		 */
		async deleteCrossed(){
			try {
				await axios.get(`/shoppingList/delete/items/allDone`);

				await this.initUserList();
				this.initAddNewItems();

				document.getElementById("delete-crossed-close-button").click();

			} catch (error) {
				console.log(error)
			}
		},

		/**
		 * Deletes all shopping list items and categories of user.
		 */
		async clearList(){
			try {
				await axios.get(`/shoppingList/delete/all/category`);

				await this.initUserList();
				this.initAddNewItems();

				document.getElementById("clear-list-close-button").click();
			} catch (error) {
				console.log(error)
			}
		},

		/**
		 * Adds a new shopping list category to user's shopping list.
		 */
		async addCategory(){
			// validate name of category
			this.newCategoryErrors = this.newCategoryInputsValid;

			if(this.newCategoryErrors.length === 0){
				try {
					await axios.post(`/shoppingList/add/category`, {
						name: this.newCategoryName.trim(),
					})

					await this.initUserList();
					this.initAddNewItems()

					document.getElementById("add-category-close-button").click();

				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newCategoryErrors.push(...error.response.data.errorMessage);
					} else {
						this.newCategoryErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		/**
		 * Edits name of an existing shopping list category of user.
		 */
		async editCategory(){
			// validate name of category
			this.newCategoryErrors = this.newCategoryInputsValid;

			if(this.newCategoryErrors.length === 0){
				try {
					await axios.post(`/shoppingList/edit/category/${this.editCategoryId}`, {
						name: this.newCategoryName.trim(),
					})

					await this.initUserList();
					this.initAddNewItems()

					document.getElementById("edit-category-close-button").click();

				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.newCategoryErrors.push(...error.response.data.errorMessage);
					} else {
						this.newCategoryErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		/**
		 * Deletes shopping list category of user (with all the items in it).
		 */
		async deleteCategory(){
			try {
				await axios.get(`/shoppingList/delete/category/${this.deleteCategoryId}`);

				await this.initUserList();
				this.initAddNewItems()

				document.getElementById("delete-category-close-button").click();
			} catch (error) {
				console.log(error)
			}
		},

		/**
		 * Adds an empty new item field to shopping list category.
		 * @param categoryId categoryId of category to add new item field to
		 */
		addNewItem(categoryId) {
			this.addedNewItems[categoryId].push({
				name: "",
				amount: null,
				unitId: null,
			});
		},

		/**
		 * Deletes new item field from shopping list category.
		 * @param categoryId categoryId of category to delete new item field from
		 * @param index index of new item field
		 */
		deleteItem(categoryId, index){
			this.addedNewItems[categoryId].splice(index, 1);

			if(this.addedNewItems[categoryId].length === 0){
				this.itemUploadErrors[categoryId] = [];
			}
		},

		/**
		 * Validates new item inputs of given shopping list category.
		 * @param categoryId categoryId of category
		 * @returns array of validation error messages
		 */
		itemInputsValid(categoryId){
			let errors = [];

			// does every item have a name
			for(const item of this.addedNewItems[categoryId]){
				if(item.name.trim() === ""){
					errors.push("Please give the name of every item.");
					break;
				}
			}

			// is the name of an item longer than 100 characters
			for (let i = 0; i < this.addedNewItems[categoryId].length; i++) {
				if(this.addedNewItems[categoryId][i].name.trim().length > 100){
					errors.push("Item name can't be longer than 100 characters.");
					break;
				}
			}

			return errors;
		},

		/**
		 * Checks if name of category matches the search term.
		 * @param category category to check
		 * @returns {boolean} true if category name matches the search term
		 */
		categoryMatch(category){
			return (category.name.toLowerCase()).includes(this.categorySearchInput.toLowerCase());
		},

		/**
		 * Checks if item matches the search term.
		 * @param item item to check
		 * @returns {boolean} true if item matches the search term
		 */
		itemMatch(item){
			let fullItemString = (item.amount ? item.amount + " " : "")  + (item.unit ? item.unit.name + " " : "") + item.name;
			return (fullItemString.toLowerCase()).includes(this.itemSearchInput.toLowerCase());
		},

		setView(type){
			this.view = type;
		},

		openEditCategoryModal(categoryId, categoryName){
			let editCategoryModal = new Modal(document.getElementById("edit-category-modal"), {});
			editCategoryModal.show();

			this.editCategoryId = categoryId;
			this.newCategoryName = categoryName;
		},

		openDeleteCategoryModal(categoryId){
			let deleteCategoryModal = new Modal(document.getElementById("delete-category-modal"), {});
			deleteCategoryModal.show();

			this.deleteCategoryId = categoryId;
		},

		/**
		 * Add modal clearing functions to the modal closing events.
		 */
		setModalHandlers() {
			const addCategoryModal = document.getElementById('add-category-modal');
			addCategoryModal.addEventListener("hidden.bs.modal", () => this.clearAddCategoryName());

			const editCategoryModal = document.getElementById('edit-category-modal');
			editCategoryModal.addEventListener("hidden.bs.modal", () => this.clearAddCategoryName());
		},

		clearAddCategoryName(){
			this.newCategoryName = "";
			this.newCategoryErrors = [];

		},
	},

	computed: {
		/**
		 * Validates shopping list category name inputs.
		 * @returns array of validation error messages
		 */
		newCategoryInputsValid(){
			let errors = [];

			// is the category name field filled
			if(this.newCategoryName.trim() === ""){
				errors.push("Please provide a name for the category.");

			}

			// is the category name longer than 100 characters
			if(this.newCategoryName.trim().length > 100){
				errors.push("Category name can't be longer than 100 characters.");
			}

			return errors;
		},
	},

	async mounted() {
		this.setModalHandlers();

		await this.initUserList();
		this.initAddNewItems();
		await this.initUnits();
	}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 80px auto 140px auto;
		font-family: Gotu, serif;

		.title-text {
			font-size: 2rem;
			text-align: center;
			margin-bottom: 50px;
		}

		.shopping-list-header {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			margin-bottom: 10px;

			.delete-buttons-container {
				display: flex;
				justify-content: right;
				margin-bottom: 10px;
				gap: 10px;

				.delete-crossed-button, .clear-list-button {
					background-color: var(--yellow);
					border: 1px solid var(--lightgrey);
					border-radius: 20px;
					padding: 3px 20px;
					height: 3rem;

					&:hover {
						opacity: 0.8;
					}
				}
			}

			.search-and-views-container {
				display: flex;
				justify-content: space-between;

				.searchbar {
					padding: 1% 3%;
					border-radius: 20px;
					height: 3rem;
					border: 2px solid var(--darkgreen);
					width: 50%;

					&:focus {
						outline: 2.5px solid var(--darkgreen);
					}
				}

				.change-view-button {
					background-color: var(--darkgreen);
					border: 1px solid var(--lightgrey);
					border-radius: 20px;
					padding: 3px 20px;
					height: 3rem;

					&:hover {
						opacity: 0.8;
					}
				}
			}

		}

		.list-view {
			.list-container {
				display: flex;
				flex-direction: column;
				gap: 10px;
				font-size: 1.1rem;
				padding: 30px 5%;
				background-color: var(--lightgreen);
				border-radius: 20px;
				margin-top: 40px;

				.no-items-container {
					text-align: center;

					.no-items-text {
						color: var(--mediumgrey);
						font-size: 0.9rem;
					}
				}

				.list-item {
					display: flex;
					align-items: center;


					.checkbox-input {
						width: 25px;
						height: 25px;
						min-width: 25px;
						min-height: 25px;
						accent-color: var(--yellow);
						margin-right: 15px;

						&:hover {
							cursor: pointer;
						}
					}

					.checked-amount {
						color: var(--mediumgrey);
					}

					.crossed {
						text-decoration: line-through;
					}
				}
			}
		}

		.category-view {
			.list-container {
				display: flex;
				flex-direction: column-reverse;

				.list-category {
					margin-bottom: 50px;

					&:hover {
						.category-header {
							.icons-container {
								.edit-icon, .delete-icon {
									display: block;
								}

							}
						}
					}

					.category-header {
						display: flex;
						justify-content: space-between;
						gap: 15px;
						background-color: var(--darkgreen);
						border-top-left-radius: 20px;
						border-top-right-radius: 20px;
						font-size: 1.3rem;
						padding: 15px 25px 10px 25px;

						.icons-container {
							display: flex;
							align-items: center;
							min-width: 55px;

							.edit-icon, .delete-icon {
								display: none;
								width: 20px;
								height: 20px;

								&:hover {
									cursor: pointer;
									opacity: 0.8;
								}
							}

							.edit-icon {
								margin-right: 15px;
							}
						}
					}

					.category-list-items {
						display: flex;
						flex-direction: column;
						gap: 10px;
						background-color: var(--lightgreen);
						font-size: 1.1rem;
						padding: 2.5% 5%;

						.no-items-container {
							text-align: center;

							.no-items-text {
								color: var(--mediumgrey);
								font-size: 0.9rem;
							}
						}

						.category-list-item {
							display: flex;
							align-items: center;


							.checkbox-input {
								width: 25px;
								height: 25px;
								min-width: 25px;
								min-height: 25px;
								accent-color: var(--yellow);
								margin-right: 15px;

								&:hover {
									cursor: pointer;
								}
							}

							.crossed {
								text-decoration: line-through;
							}
						}

						.new-items-container {
							.new-item {
								display: flex;
								justify-content: space-between;
								align-items: center;
								gap: 10px;
								width: 100%;
								margin-bottom: 10px;

								&:first-child {
									margin-top: 20px;
								}

								.new-item-inputs-container {
									width: 100%;
									display: flex;
									justify-content: space-between;
									align-items: center;
									gap: 5px;
								}

								.item-name-input, .item-amount-input, .item-unit-input{
									border-radius: 10px;
									border-color: transparent;
									padding: 7px 15px;
									font-size: 1rem;
									font-family: Gotu,serif;
									height: 2.7rem;

									&:focus {
										outline: var(--darkgreen) solid 3px;
									}
								}

								.item-name-input {
									width: 100%;
								}

								.item-unit-input {
									width: 50%;
								}

								.item-amount-input {
									width: 30%;
									margin-left: 10px;

									&::-webkit-outer-spin-button,
									&::-webkit-inner-spin-button {
										-webkit-appearance: none;
										margin: 0;
									}
								}

								input[type=number] {
									-moz-appearance: textfield;
								}

								.ingredient-unit-input {
									width: 25%;

									&:invalid {
										color: grey;
									}


								}

								.delete-item-button {
									margin-left: 10px;

									&:hover {
										cursor: pointer;
									}
								}

								.delete-item-button {
									height: 1.2rem;
								}
							}

							.add-item-btn-container {
								display: flex;
								justify-content: right;

								.add-item-btn {
									background-color: var(--yellow);
									border: 1px solid var(--lightgrey);
									border-radius: 20px;
									padding: 2px 20px;
									margin-top: 10px;
									margin-right: 35px;

									&:hover {
										opacity: 0.8;
									}
								}
							}
						}
					}

					.add-item-button {
						background-color: var(--yellow);
						display: flex;
						justify-content: center;
						align-items: center;
						padding: 10px;

						&:hover {
							opacity: 0.8;
							cursor: pointer;
						}

						.add-item-text {
							margin-bottom: -4px;
						}

						.add-item-icon {
							width: 30px;
							margin-right: 10px;

						}
					}
				}
			}

			.no-category-container {
				text-align: center;
				margin-top: 50px;
				margin-bottom: 40px;

				.no-category-text {
					color: var(--mediumgrey);
				}
			}

			.add-category-button {
				display: flex;
				align-items: center;
				justify-content: left;
				width: fit-content;
				margin-bottom: 20px;
				margin-top: 40px;

				&:hover {
					cursor: pointer;

					.add-category-text{
						&::after {
							transform: scaleX(1);
							transform-origin: bottom left;
						}
					}
				}

				.add-category-text {
					margin-bottom: -4px;

					display: inline-block;
					position: relative;

					&::after {
						content: '';
						position: absolute;
						width: 100%;
						transform: scaleX(0);
						height: 3px;
						bottom: 0;
						left: 0;
						background-color: var(--yellow);
						transform-origin: bottom right;
						transition: transform 0.25s ease-out;
					}
				}

				.add-category-icon {
					width: 30px;
					margin-right: 10px;
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

	.add-category , .edit-category{
		margin: 0 10% 30px 10%;
		font-family: Gotu, serif;

		text-align: left;
		display: flex;
		flex-direction: column;

		.add-category-form, .edit-category-form{
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.add-category-input, .edit-category-input {
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
		.add-category-button, .edit-category-button {
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

	.delete-category, .delete-crossed, .clear-list {
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

	.alert {
		width: 100%;

		.add-category-error-items, .edit-category-error-items {
			font-size: 0.8rem;
		}

		&.add-category-alert, &.edit-category-alert {
			padding-bottom: 5px;
		}
	}

	@media screen and (max-width: 690px){
		.new-item {
			margin-bottom: 15px !important;

			.item-amount-input, .item-unit-input, .item-name-input {
				width: 100% !important;
				margin-left: 0 !important;
			}

			.new-item-inputs-container {
				flex-direction: column !important;
				gap: 5px !important;
			}
		}
	}

	@media screen and (max-width: 575px){
		.content {
			margin-left: 10px;
			margin-right: 10px;

			.edit-icon, .delete-icon {
				width: 18px !important;
				height: 18px !important;
			}

			.shopping-list-header {
				flex-direction: column;

				.delete-buttons-container {
					flex-direction: column;

					.delete-crossed-button, .clear-list-button{
						margin: 0 0 0 auto;
						padding: 10px 20px;
						width: 100%;
					}
				}

				.search-and-views-container {
					flex-direction: column-reverse;
					gap: 10px;

					.searchbar {
						width: 100%;
						margin-bottom: 15px;
					}

					.change-view-button {
						margin: 0 0 0 auto;
						padding: 10px 20px;
						width: 100%;
					}
				}
			}
		}
	}

	@media (hover: none) {
		.edit-icon, .delete-icon {
			display: block !important;
		}

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