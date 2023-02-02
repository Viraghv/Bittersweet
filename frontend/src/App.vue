<template>
	<Navbar/>
	<div class="app-container">
		<router-view></router-view>
	</div>
	<Footer/>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";

</script>

<style scoped lang="scss">

	.app-container {
		min-height: 100vh;
	}

</style>
