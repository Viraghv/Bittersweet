<template>
	<div class="content col-xxl-8 col-xl-9 col-lg-10 col-md-11 col-sm-11">
		<div class="navbar-container">
			<AdminNavbar current-page="UserAdmin"/>
		</div>
		<div class="main-container">

		</div>
	</div>
</template>

<script>
import AdminNavbar from "@/components/AdminNavbar.vue";

export default {
	name: "UsersAdmin",
	components: {AdminNavbar}
}
</script>

<style scoped lang="scss">
	.content {
		margin: 60px auto 140px auto;
		font-family: Gotu, serif;

	}
</style>