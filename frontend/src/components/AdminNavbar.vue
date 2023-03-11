<!-- Navbar component on admin page -->

<template>
	<div class="navbar-container">
		<router-link class="link" :class="currentPage === 'UsersAdmin' ? 'selected' : ''" :to="{name: 'UsersAdmin'}">Users</router-link>
		<router-link class="link" :class="currentPage === 'RecipesAdmin' ? 'selected' : ''" :to="{name: 'RecipesAdmin'}">Recipes</router-link>
		<router-link class="link" :class="currentPage === 'CommentsAdmin' ? 'selected' : ''" :to="{name: 'CommentsAdmin'}">Comments</router-link>
		<hr>
		<router-link class="link" :class="currentPage === 'UnitsAdmin' ? 'selected' : ''" :to="{name: 'UnitsAdmin'}">Units</router-link>
		<router-link class="link" :class="currentPage === 'DietsAdmin' ? 'selected' : ''" :to="{name: 'DietsAdmin'}">Diets</router-link>
		<router-link class="link" :class="currentPage === 'AllergensAdmin' ? 'selected' : ''" :to="{name: 'AllergensAdmin'}">Allergens</router-link>
		<router-link class="link" :class="currentPage === 'CategoriesAdmin' ? 'selected' : ''" :to="{name: 'CategoriesAdmin'}">Categories</router-link>
		<hr>
		<router-link class="link" :class="currentPage === 'StatisticsAdmin' ? 'selected' : ''" :to="{name: 'StatisticsAdmin'}">Statistics</router-link>
	</div>

</template>

<script>
export default {
	name: "AdminNavbar",
	props: {
		currentPage: "",
	}
}
</script>

<style scoped lang="scss">
	.navbar-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		background-color: var(--lightgreen);
		padding: 20px;
		border-radius: 20px;

		.link {
			color: black;
			text-decoration: none;
			padding: 2% 4%;
			border-radius: 10px;

			&:hover {
				background-color: var(--darkgreen);
			}

			&.selected {
				background-color: var(--darkgreen);
			}
		}

		hr {
			color: var(--darkgrey);
		}
	}
</style>