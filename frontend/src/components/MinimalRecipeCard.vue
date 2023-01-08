<template>
	<div class="container">
		<div class="image-info-container" @click="navigateToRecipePage">
			<div class="recipe-image-container">
				<img class="recipe-image" :src="'data:image/' + photoExt + ';base64,'+ photo" alt="recipe-image" v-if="photo" />
				<img class="recipe-image" src='/src/assets/recipe_photos/default_recipe_photo.png' alt="recipe-image" v-else>
			</div>
			<div class="info-container">
				<div class="name">
					<span>{{name.length <= 50 ? name : name.substring(0,50) + '...'}}</span>
				</div>
				<div class="uploaded">
					<span>Uploaded: {{formattedUploaded}}</span>
				</div>
			</div>
		</div>
		<div class="action-buttons">
			<img class="add-icon" src="@/assets/icons/plus_grey.png" alt="add" @click="emitAdd" v-if="page === 'allFavourites'">
			<img class="delete-icon" src="@/assets/icons/bin_grey.png" alt="delete" @click="emitDelete" v-if="page === 'allFavourites'">

			<img class="delete-icon" src="@/assets/icons/bin_grey.png" alt="delete" @click="emitDelete" v-if="page === 'groups'">

			<img class="edit-icon" src="@/assets/icons/edit_grey.png" alt="edit" @click="emitEdit" v-if="page === 'profile'">
			<img class="delete-icon" src="@/assets/icons/bin_grey.png" alt="delete" @click="emitDelete" v-if="page === 'profile'">
		</div>
	</div>
</template>

<script>
export default {
	name: "MinimalRecipeCard",
	props: {
		id: null,
		name: "",
		uploaded: "",
		photo: "",
		photoExt: "",

		page: "",
	},

	methods: {
		navigateToRecipePage() {
			window.scrollTo(0,0);
			this.$router.push({path: `/recipe/${this.id}`});
		},

		emitAdd(){
			this.$emit('add', this.id);
		},

		emitEdit(){
			this.$emit('edit', this.id);
		},

		emitDelete(){
			this.$emit('delete', this.id);
		},
	},

	computed: {
		formattedUploaded(){
			return new Date(this.uploaded.split(" ")[0]).toLocaleDateString("en-GB");
		},
	}
}
</script>

<style scoped lang="scss">
	.container {
		display: flex;
		justify-content: left;
		align-items: center;
		margin-left: auto;
		margin-right: auto;
		padding: 0;

		&:hover {
			background-color: var(--darkgreen);

			.action-buttons {
				display: flex;
				justify-content: right;
				align-self: flex-start;
				margin-left: auto;
				padding-top: 15px;
				padding-right: 25px;
				gap: 15px;

				.add-icon, .delete-icon, .edit-icon {
					width: 20px;
					display: block;

					&:hover {
						cursor: pointer;
						opacity: 0.8;
					}
				}
			}
		}

		.image-info-container {
			display: flex;
			justify-content: left;
			align-items: center;
			width: 100%;

			&:hover {
				cursor: pointer;
			}
		}

		.recipe-image-container {
			background-color: var(--lightgreen);
			width: 150px;
			height: 150px;
			margin-right: 30px;

			.recipe-image {
				width: 150px;
				height: 150px;
				object-fit: cover;
			}
		}

		.info-container {
			.name {
				font-size: 1.3rem;
			}
			.uploaded {
				font-size: 0.9rem;
				color: var(--mediumgrey);
			}
		}

		.add-icon, .delete-icon, .edit-icon {
			display: none;
		}

	}


</style>