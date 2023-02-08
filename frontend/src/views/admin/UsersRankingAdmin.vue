<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="admin-navbar-container">
			<AdminNavbar current-page="StatisticsAdmin"/>
		</div>
		<div class="main-container">
			<h2>Users ranked by activity</h2>
			<table class="users-ranking-table">
				<tr class="header-row">
					<th class="first-header rank-cell">Rank</th>
					<th>Username</th>
					<th>Joined</th>
					<th>Recipes</th>
					<th class="last-header">Comments</th>
				</tr>
				<tr v-for="(user, index) in rankedUsers" :key="index">
					<td class="rank-cell"><b>{{(currentPage-1)*25 + index+1}}</b></td>
					<td>{{user.username.length < 30 ? user.username : user.username.substring(0, 30) + '...' }}</td>
					<td>{{new Date(user.joined.split(" ")[0]).toLocaleDateString("en-GB")}}</td>
					<td>{{user.recipeCount}}</td>
					<td>{{user.commentsCount}}</td>
				</tr>
			</table>
			<p class="no-results-text" v-if="rankedUsers.length === 0">No results</p>
			<div class="pagination-container">
				<Pagination :total-items="activeUsersCount" :items-per-page="25" @change-page="initRankedUsers" v-if="rankedUsers.length > 0"/>
			</div>
		</div>
	</div>
</template>

<script>
import {beforeRouteEnter} from "@/handlers/userLoggedInAndAdminNavGuard.js";
import AdminNavbar from "@/components/AdminNavbar.vue";
import Pagination from "@/components/Pagination.vue";
export default {
	name: "UsersRankingAdmin",
	components: {Pagination, AdminNavbar},
	beforeRouteEnter,

	data(){
		return {
			activeUsersCount: 0,
			rankedUsers: [],
			currentPage: 1,
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

		async initRankedUsers(page){
			window.scrollTo(0,0);

			try {
				const response = await this.axios.get(`/user/admin/ranked/${page}`);
				this.rankedUsers = response.data

				this.currentPage = page;
			} catch (error) {
				console.log(error.response.data);
			}
		},
	},

	mounted() {
		this.initActiveUserCount();
		this.initRankedUsers(1);
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

		.users-ranking-table {
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

		.pagination-container {
			display: flex;
			justify-content: center;
			margin-top: 30px;
		}
	}
}

@media screen and (max-width: 785px){
	.content {
		flex-direction: column;

		.admin-navbar-container {
			width: 100%;
			margin-bottom: 50px;
		}

		.main-container {
			width: 100%;
			margin-left: 0;
		}
	}
}
</style>