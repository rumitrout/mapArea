<template>
    <table>
        <tr>
            <th>
                Coordinates
            </th>
            <td>
                <ul>
                    <li :key="index" v-for="(point, index) in state.turfPoints">
                      {{`{Lat: ${point[0]}, Lng: ${point[1]} }`}}
                    </li>
                </ul>
            </td>
        </tr>
        <tr>
            <th>Area</th>
            <td>
                {{state.area}} m<sup>2</sup>
            </td>
        </tr>
    </table>
</template>

<script>
import store from '../store';
export default {
    name: 'Result',
    data() {
        return {
            state: store.state,
        }
    },
}
</script>

<style>
ul {
    list-style: none;
}
</style>