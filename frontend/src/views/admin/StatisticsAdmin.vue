<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="StatisticsAdmin"/>
		</div>
		<div class="main-container">
			<div class="analytics-container">
				<a class="analytics-link" target="_blank" href="https://analytics.google.com/analytics/web/?authuser=3#/p351230128/reports/intelligenthome?params=_u..nav%3Dmaui">
					<button class="analytics-btn" type="button">
						<img class="analytics-logo" src="@/assets/GAnalytics.png" alt="GA">
						Google Analytics
					</button>
				</a>
			</div>
			<div class="counters-container">
				<div class="active-user-count">
					<span class="first-line">There are currently</span>
					<span class="main-line">{{activeUsersCount}}</span>
					<span class="last-line">active users</span>
				</div>
				<div class="recipes-count">
					<span class="first-line">There are currently</span>
					<span class="main-line">{{recipesCount}}</span>
					<span class="last-line">uploaded recipes</span>
				</div>
			</div>
			<div class="users-ranking-container">
				<h2>Most active users</h2>
				<table class="users-ranking-table">
					<tr class="header-row">
						<th class="first-header rank-cell rank-th">Rank</th>
						<th class="username-th">Username</th>
						<th class="joined-th">Joined</th>
						<th class="recipes-th">Recipes</th>
						<th class="last-header comments-th">Comments</th>
					</tr>
					<tr v-for="index in (rankedUsers.length < 5 ? rankedUsers.length : 5)" :key="index">
						<td class="rank-cell rank-td"><b>{{index}}</b></td>
						<td class="username-td">{{rankedUsers[index-1].username.length < 30 ? rankedUsers[index-1].username : rankedUsers[index-1].username.substring(0, 30) + '...' }}</td>
						<td class="joined-td">{{new Date(rankedUsers[index-1].joined.split(" ")[0]).toLocaleDateString("en-GB")}}</td>
						<td class="recipes-td">{{rankedUsers[index-1].recipeCount}}</td>
						<td class="comments-td">{{rankedUsers[index-1].commentsCount}}</td>
					</tr>
				</table>
				<p class="no-results-text" v-if="rankedUsers.length === 0">No results</p>
				<div class="view-all-container">
					<router-link class="view-all-link" :to="{name: 'UsersRankingAdmin'}">View all</router-link>
				</div>
			</div>
			<div class="categories-ranking-container">
				<h2>Most popular categories</h2>
				<table class="categories-ranking-table">
					<tr class="header-row">
						<th class="first-header rank-cell rank-th">Rank</th>
						<th class="category-th">Category</th>
						<th class="last-header number-of-recipes-th">Number of recipes</th>
					</tr>
					<tr v-for="index in (rankedCategories.length < 5 ? rankedCategories.length : 5)" :key="index">
						<td class="rank-cell rank-td"><b>{{index}}</b></td>
						<td class="category-td">{{rankedCategories[index-1].name}}</td>
						<td class="number-of-recipes-td">{{rankedCategories[index-1]._count.recipes}}</td>
					</tr>
				</table>
				<p class="no-results-text" v-if="rankedCategories.length === 0">No results</p>
				<div class="view-all-container">
					<router-link class="view-all-link" :to="{name: 'CategoriesRankingAdmin'}">View all</router-link>
				</div>
			</div>

		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInAndAdminNavGuard.js";
import AdminNavbar from "@/components/AdminNavbar.vue";
export default {
	name: "StatisticsAdmin",
	components: {AdminNavbar},
	beforeRouteEnter,

	data(){
		return {
			activeUsersCount: 0,
			recipesCount: 0,
			rankedUsers: [],
			rankedCategories: [],
		}
	},

	methods: {
		async initActiveUserCount(){
			try {
				const response = await this.axios.get(`/user/allUserCount/active`);
				this.activeUsersCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initRecipesCount(){
			try {
				const response = await this.axios.get(`/recipe/allRecipeCount`);
				this.recipesCount = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initRankedUsers(){
			try {
				const response = await this.axios.get(`/user/admin/ranked/1`);
				this.rankedUsers = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		},

		async initRankedCategories(){
			try {
				const response = await this.axios.get(`/recipe/admin/categories/ranked/1`);
				this.rankedCategories = response.data;
			} catch (error) {
				console.log(error.response.data);
			}
		}
	},

	mounted() {
		this.initActiveUserCount();
		this.initRecipesCount();
		this.initRankedUsers();
		this.initRankedCategories();
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

		.analytics-container {
			display: flex;
			justify-content: right;

			.analytics-link {
				.analytics-btn {
					background-color: var(--lightgreen);
					border: 1px solid var(--lightgrey);
					border-radius: 20px;
					padding: 5px 20px;

					&:hover {
						opacity: 0.8;
					}

					.analytics-logo {
						width: 20px;
						margin-right: 10px;
					}
				}
			}
		}

		.counters-container {
			display: flex;
			justify-content: space-evenly;
			margin-top: 40px;

			.active-user-count, .recipes-count {
				background-size: contain;
				min-width: fit-content;
				width: 330px;
				height: 310px;
				border-radius: 20px;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				padding: 20px;

				span {
					display: block;
				}

				.first-line {
					font-size: 24px;
				}

				.main-line {
					text-align: center;
					font-size: 64px;
				}

				.last-line {
					text-align: right;
					font-size: 24px;
				}
			}

			.active-user-count {
				background-image: url("@/assets/active_users_bg.png");

				.main-line {
					color: #005D63;
				}

			}

			.recipes-count {
				background-image: url("@/assets/recipes_bg.png");

				.main-line {
					color: #FF9900;
				}
			}
		}

		.users-ranking-container, .categories-ranking-container {
			margin-top: 60px;

			.users-ranking-table, .categories-ranking-table {
				width: 100%;
				margin-top: 20px;

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

				.category-td {
					word-break: break-all;
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

				.rank-cell {
					text-align: center;
					width: 10%;
					min-width: fit-content;
					white-space: nowrap;
				}
			}

			.no-results-text {
				color: var(--mediumgrey);
				text-align: center;
				margin-top: 20px;
			}

			.view-all-container {
				display: flex;
				justify-content: right;
				margin-top: 20px;
				margin-right: 10px;

				.view-all-link {
					color: var(--linkyellow);
				}
			}
		}

	}
}

@media screen and (max-width: 1080px){
	.counters-container {
		flex-direction: column;
		gap: 20px;
		align-items: center;
	}
}

@media screen and (max-width: 500px){
	.active-user-count, .recipes-count {
		width: 100% !important;
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
		}
	}
}

@media screen and (max-width: 575px){
	.content {
		margin-left: 10px;
		margin-right: 10px;
	}

	.joined-th, .joined-td {
		display: none;
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