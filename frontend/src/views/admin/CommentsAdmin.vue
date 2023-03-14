<!-- Admin page, comments view -->

<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="CommentsAdmin"/>
		</div>
		<div class="main-container">
			<div class="filters-container">
				<div class="left">
					<Multiselect class="search-by-multiselect" v-model="selectedSearchBy" :options="searchByOptions" :searchable="false" :can-clear="false" :can-deselect="false"/>
					<div class="searchbar-container">
						<input class="searchbar" type="text" v-model="searchTerm" :placeholder="searchbarPlaceholder" @keydown.enter="searchForComment">
						<button type="button" class="search-button" @click="searchForComment">
							<img class="search-icon" src="@/assets/icons/magnifying-glass_white.png" alt="Search">
						</button>
					</div>
				</div>
				<div class="right">
					<label class="sort-label" for="sort-input">Sort by:</label>
					<Multiselect class="sort-input" name="sort-input" v-model="selectedSortType" :options="sortTypeOptions" :searchable="false" :can-clear="false" :can-deselect="false"/>
				</div>
			</div>
			<div class="comments-table-container">
				<table class="comments-table">
					<tr class="header-row">
						<th class="first-header id-th">ID</th>
						<th class="rating-th">Rating</th>
						<th class="content-th">Content</th>
						<th class="uploaded-th">Uploaded</th>
						<th class="user-th">User</th>
						<th class="last-header recipe-id-th" colspan="2">RecipeID</th>
					</tr>
					<tr v-for="(comment, index) in comments" :key="index">
						<td class="id-td">{{comment.id}}</td>
						<td class="rating-td">{{comment.rating}}</td>
						<td class="content-td">{{comment.content.length < 200 ? comment.content : comment.content.substring(0, 200) + '...' }}</td>
						<td class="uploaded-td">{{new Date(comment.uploaded.split(" ")[0]).toLocaleDateString("en-GB")}}</td>
						<td class="user-td">{{comment.user.length < 30 ? comment.user : comment.user.substring(0, 30) + '...' }}</td>
						<td class="recipe-id-td">{{comment.recipeId}}</td>

						<td class="options-icon-cell">
							<button class="options-btn" :id="'options-icon' + index" data-bs-toggle="dropdown"  aria-expanded="false" data-bs-offset="20, 10">
								<img class="options-icon" src="@/assets/icons/dots_grey.png" alt="options-icon"/>
							</button>
							<ul class="dropdown-menu dropdown-menu-end options-dropdown" :aria-labelledby="'options-icon' + index">
								<li class="dropdown-item" @click="openEditCommentModal(comment)">
									<img class="edit-icon icon" src="@/assets/icons/edit.png" alt="edit">
									Edit
								</li>
								<li class="dropdown-item" @click="openDeleteCommentModal(comment.id)">
									<img class="delete-icon icon" src="@/assets/icons/bin.png" alt="delete">
									Delete
								</li>
							</ul>
						</td>
					</tr>
				</table>
				<p class="no-results-text" v-if="commentsCount === 0">No results</p>
			</div>
			<div class="pagination-container">
				<Pagination :total-items="commentsCount" :items-per-page="25" @change-page="initComments" v-if="comments.length > 0"/>
			</div>
		</div>
	</div>

	<div class="modal modal-lg fade" id="edit-comment-modal" ref="edit-comment-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<button id="edit-comment-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<form class="edit-comment-modal-container">
					<div class="rating-container">
						<span class="rating-text">Rating:</span>
						<div class="rating">
							<input type="radio" name="rating" value="5" id="5" v-model="editCommentInputs.rating"><label for="5">☆</label>
							<input type="radio" name="rating" value="4" id="4" v-model="editCommentInputs.rating"><label for="4">☆</label>
							<input type="radio" name="rating" value="3" id="3" v-model="editCommentInputs.rating"><label for="3">☆</label>
							<input type="radio" name="rating" value="2" id="2" v-model="editCommentInputs.rating"><label for="2">☆</label>
							<input type="radio" name="rating" value="1" id="1" v-model="editCommentInputs.rating"><label for="1">☆</label>
						</div>
					</div>
					<div class="comment-content-container">
						<label for="comment-content" class="content-text">Content:</label>
						<textarea class="comment-content-input" id="comment-content" maxlength="300" v-model="editCommentInputs.content"/>
						<span class="comment-content-counter">{{editCommentInputs.content.length}}/300</span>
					</div>
					<div class="edit-comment-alert alert alert-danger" v-if="editCommentErrors.length !== 0">
						<strong>Submit failed!</strong><br>
						<ul>
							<li class="comment-error-items" v-for="(error, index) in editCommentErrors" :key="index">{{error}}</li>
						</ul>
					</div>
					<div class="edit-comment-btn-container">
						<button class="edit-comment-btn" type="button" @click="editComment">Edit comment</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<div class="modal fade" id="delete-comment-modal" ref="delete-comment-modal">
		<div class="modal-dialog">
			<div class="modal-content">

				<div class="modal-header">
					<img class="warning-icon d-none d-sm-block" src="@/assets/icons/warning.png" alt="warning">
					<button id="delete-comment-close-button" type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>

				<div class="delete-comment">
					<span>Are you sure you want to delete this comment?</span><br>

					<div class="delete-comment-alert alert alert-danger" v-if="deleteCommentErrors.length !== 0">
						<strong>Error!</strong><br>
						<ul>
							<li class="delete-comment-error-items" v-for="(error, index) in deleteCommentErrors" :key="index">{{error}}</li>
						</ul>
					</div>

					<button class="action-btn" @click="deleteComment">Delete</button>
					<button class="cancel-btn" data-bs-dismiss="modal">Cancel</button>
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
	name: "CommentsAdmin",
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
				content: "Content",
				username: "Username",
				recipeId: "Recipe ID",
			},

			searchTerm: "",

			selectedSortType: "idDesc",
			sortTypeOptions: {
				idAsc: "ID &#8593",
				idDesc: "ID &#8595",
				ratingAsc: "Rating &#8593",
				ratingDesc: "Rating &#8595",
				uploadedAsc: "Uploaded &#8593",
				uploadedDesc: "Uploaded &#8595",
				usernameAsc: "Username &#8593",
				usernameDesc: "Username &#8595",
				recipeIdAsc: "Recipe ID &#8593",
				recipeIdDesc: "Recipe ID &#8595",
			},

			comments: [],
			commentsCount: 0,

			currentPage: 1,
			currentCommentId: null,

			editCommentInputs: {
				rating: null,
				content: "",
			},

			editCommentErrors: [],
			deleteCommentErrors: [],
		}
	},

	methods: {
		/**
		 * Initializes number of all comments (for pagination).
		 */
		async initCommentsCount(){
			try {
				const response = await this.axios.post(`/recipe/admin/comment/count`, this.searchObj)
				this.commentsCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		/**
		 * Initializes comments of current page.
		 * @param page page to get
		 */
		async initComments(page){
			try {
				const response = await this.axios.post(`/recipe/admin/comment/all/${this.selectedSortType}/${page}`, this.searchObj);
				this.comments = response.data;
				this.currentPage = page;
			} catch (error) {
				console.log(error.response.data);

			}
		},

		/**
		 * Edits a single comment.
		 */
		async editComment(){
			// validate comment data
			this.editCommentErrors = this.commentInputsAreValid;
			if(this.editCommentErrors.length === 0){
				try {
					await this.axios.post(`/recipe/admin/comment/edit/${this.currentCommentId}`, {
						content: this.editCommentInputs.content,
						rating: Number(this.editCommentInputs.rating),
					});

					document.getElementById("edit-comment-close-button").click();
					await this.initComments(this.currentPage);
				} catch (error) {
					if(Array.isArray(error.response.data.errorMessage)){
						this.editCommentErrors.push(...error.response.data.errorMessage);
					} else {
						this.editCommentErrors.push(error.response.data.errorMessage);
					}
				}
			}
		},

		/**
		 * Deletes a single comment.
		 */
		async deleteComment(){
			try {
				await this.axios.get(`/recipe/admin/comment/delete/${this.currentCommentId}`);
				document.getElementById("delete-comment-close-button").click();

				await this.initCommentsCount();

				// check if after delete the current page still exists, if not, navigate to previous one
				if(!this.currentCommentsPageExists){
					this.currentPage--;

					let paginateButtons = document.getElementsByClassName("paginate-buttons");

					for (let i = 0; i < paginateButtons.length; i++) {
						if(paginateButtons[i].innerHTML === String(this.currentPage)){
							paginateButtons[i].click();
						}
					}
				}

				await this.initComments(this.currentPage);

			} catch (error) {
				if (Array.isArray(error.response.data.errorMessage)) {
					this.deleteCommentErrors.push(...error.response.data.errorMessage);
				} else {
					this.deleteCommentErrors.push(error.response.data.errorMessage);
				}
			}
		},

		/**
		 * Initializes comments again with given search filters.
		 */
		searchForComment(){
			this.initComments(1);
			this.initCommentsCount();
			this.currentPage = 1;

			let paginateButtons = document.getElementsByClassName("paginate-buttons");

			for (let i = 0; i < paginateButtons.length; i++) {
				if(paginateButtons[i].innerHTML === "1"){
					paginateButtons[i].click();
				}
			}
		},

		openEditCommentModal(comment){
			this.currentCommentId = comment.id;
			this.editCommentInputs.rating = comment.rating;
			this.editCommentInputs.content = comment.content;

			let editCommentModal = new Modal(document.getElementById("edit-comment-modal"), {});
			editCommentModal.show();
		},

		openDeleteCommentModal(commentId){
			let deleteCommentModal = new Modal(document.getElementById("delete-comment-modal"), {});
			deleteCommentModal.show();

			this.currentCommentId = commentId;
		},

		clearEditCommentModal(){
			this.editCommentInputs.rating = null;
			this.editCommentInputs.content = "";
			this.editCommentErrors = [];
			this.currentCommentId = null;
		},

		clearDeleteCommentModal(){
			this.deleteCommentErrors = [];
			this.currentCommentId = null;
		},

		/**
		 * Add modal clearing functions to the modal closing events.
		 */
		setModalHandlers(){
			const editCommentModal = document.getElementById('edit-comment-modal');
			editCommentModal.addEventListener("hidden.bs.modal", () => this.clearEditCommentModal());

			const deleteCommentModal = document.getElementById('delete-comment-modal');
			deleteCommentModal.addEventListener("hidden.bs.modal", () => this.clearDeleteCommentModal());
		},
	},

	computed: {
		/**
		 * Changes placeholder text in searchbar based on selected search type.
		 * @returns placeholder text
		 */
		searchbarPlaceholder(){
			let placeholder = "Search by ";

			switch (this.selectedSearchBy){
				case "id": placeholder = placeholder.concat("ID..."); break;
				case "content": placeholder = placeholder.concat("content..."); break;
				case "username": placeholder = placeholder.concat("username..."); break;
				case "recipeId": placeholder = placeholder.concat("recipe ID..."); break;
			}

			return placeholder;
		},

		/**
		 * Constructs search object based on selected search type and entered search term.
		 * @returns search object
		 */
		searchObj(){
			let searchObj = {};

			searchObj.id = "";
			searchObj.content = "";
			searchObj.username = "";
			searchObj.recipeId = "";

			searchObj[this.selectedSearchBy] = this.searchTerm;

			return searchObj;
		},

		/**
		 * Validates comment data.
		 * @returns array of validation error messages
		 */
		commentInputsAreValid(){
			let errors = [];

			// was a rating given
			if(!this.editCommentInputs.rating){
				errors.push("Please rate the recipe.");
			// is the rating between 1 and 5
			} else if(this.editCommentInputs.rating < 1 || this.editCommentInputs.rating > 5) {
				errors.push("Rating must be between 1-5 stars.");
			}

			// is the comment content longer than 300 characters
			if(this.editCommentInputs.content?.trim().length > 300){
				errors.push("Content of comment can't be longer than 300 characters.");
			}

			return errors;
		},

		/**
		 * Does the current page of the comments table exists based on the comment count and page size.
		 * @returns true if page exists
		 */
		currentCommentsPageExists(){
			let lastPage = Math.ceil(this.commentsCount / 25);

			return this.currentPage <= lastPage;
		},
	},

	watch: {
		'selectedSortType'(){
			this.initComments(this.currentPage);
		}
	},

	mounted() {
		this.initCommentsCount();
		this.initComments(1);
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

				.searchbar-container {
					display: flex;

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

		.comments-table-container {

			.comments-table {
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
					white-space: break-spaces;
					overflow-wrap: anywhere;
					max-width: 10vw;
				}

				th, td {
					padding: 15px 10px;
				}

				tr {
					height: 65px;

					&:hover {
						background-color: var(--verylightgrey);

						.options-btn {
							.options-icon {
								display: block;
							}
						}
					}
				}

				.options-icon-cell {
					width: 40px;

					.options-btn {
						padding: 0;
						background-color: transparent;
						border: none;
						width: 20px;

						.options-icon {
							display: none;
						}
					}

					.options-icon {
						width: 20px;

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
							margin-right: 10%;
						}

						.dropdown-item{
							margin-bottom: 5%;
							border-radius: 10px;
							padding: 5px 20px 5px 15px;

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
				}
			}

			.no-results-text {
				color: var(--mediumgrey);
				text-align: center;
				margin-top: 20px;
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
		text-align: left;

		.delete-comment-error-items {
			font-size: 0.8rem;
		}

		&.delete-comment-alert {
			padding-bottom: 5px;
		}
	}
}

.edit-comment-modal-container {
	margin: 0 10% 30px 10%;
	font-size: 1.2rem;
	font-family: Gotu,serif;

	.rating-container {
		display: flex;
		align-items: center;

		.rating-text {
			margin-right: 20px;
		}

		.rating {
			display: flex;
			flex-direction: row-reverse;
			justify-content: center;
		}


		.rating > input{ display:none;}

		.rating > label {
			position: relative;
			width: 1.1em;
			font-size: 40px;
			content: "\2605";
			color: white;
			cursor: pointer;
		}

		.rating > label::before{
			content: "\2605";
			position: absolute;
			opacity: 0;
		}

		.rating > label:hover:before,
		.rating > label:hover ~ label:before {
			color: var(--yellow);
			opacity: 1 !important;
		}

		.rating > input:checked ~ label:before{
			color: var(--yellow);
			opacity:1;
		}

		.rating:hover > input:checked ~ label:before{ opacity: 0.4; }
	}


	.comment-content-container {
		display: flex;
		flex-direction: column;

		.comment-content-input {
			width: 100%;
			resize: none;
			border-radius: 10px;
			border-color: transparent;
			padding: 15px;
			font-size: 1rem;
			font-family: Gotu,serif;
			margin-top: 10px;
			margin-bottom: 10px;
			height: 10vh;

			&:focus {
				outline: var(--lightgreen) solid 3px;
			}
		}

		.comment-content-counter {
			width: 100%;
			text-align: right;
			font-family: Gotu,serif;
			margin-bottom: 25px;
			font-size: 0.95rem;
		}
	}

	.edit-comment-btn-container {
		display: flex;
		justify-content: center;

		.edit-comment-btn {
			background-color: var(--yellow);
			border: 1px solid var(--lightgrey);
			border-radius: 15px;
			padding: 5px 30px;

			&:hover {
				opacity: 0.8;
			}
		}
	}
}

.delete-comment {
	margin: 0 10% 30px 10%;
	text-align: center;

	.action-btn, .cancel-btn {
		border: 1px solid var(--lightgrey);
		border-radius: 20px;
		padding: 5px 30px;
		margin-top: 15px;

		&:hover {
			opacity: 0.8;
		}
	}

	.action-btn {
		background-color: var(--yellow);
		margin-right: 40px;
	}

	.cancel-btn {
		background-color: var(--lightgreen);
	}

	.delete-comment-alert {
		margin-top: 10px;
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

@media screen and (max-width: 1100px){
	.content-th, .content-td {
		display: none;
	}
}

@media screen and (max-width: 785px){
	.content {
		flex-direction: column;

		.admin-navbar-container {
			width: 100%;
			margin-bottom: 30px;
		}

		.main-container {
			width: 100%;
			margin-left: 0;

			.left {
				flex-direction: column;
				gap: 10px !important;
			}
		}
	}
}

@media screen and (max-width: 575px){
	.content {
		margin-left: 10px;
		margin-right: 10px;
	}
}

@media (hover: none) {
	.options-icon {
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