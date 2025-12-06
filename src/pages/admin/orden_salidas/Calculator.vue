<script setup>
  import { ref, watch, onMounted, onBeforeUnmount } from "vue";

  const props = defineProps({
    show: { type: Boolean, default: false },
    index: { type: Number, required: true },
  });

  const emit = defineEmits(["accept", "close"]);

  const display = ref("");
  const firstValue = ref(null);
  const operator = ref(null);

  const operationString = ref("");

  function pressNumber(num) {
    display.value += num;
  }

  function pressOperator(op) {
    if (!display.value) return;

    firstValue.value = parseFloat(display.value);
    operator.value = op;
    operationString.value = `${firstValue.value} ${op}`;
    display.value = "";
  }

  function calculate() {
    if (firstValue.value === null || !operator.value || !display.value) return;

    const second = parseFloat(display.value);
    let result = 0;

    switch (operator.value) {
      case "+":
        result = firstValue.value + second;
        break;
      case "-":
        result = firstValue.value - second;
        break;
      case "*":
        result = firstValue.value * second;
        break;
      case "/":
        if (second === 0) {
          display.value = "Error";
          return;
        }
        result = firstValue.value / second;
        break;
    }

    operationString.value = `${firstValue.value} ${operator.value} ${second}`;
    display.value = result.toString();
    operator.value = null;
    firstValue.value = null;
  }

  function clearCalc() {
    display.value = "";
    operator.value = null;
    firstValue.value = null;
    operationString.value = "";
  }

  function acceptResult() {
    if (!display.value) return;
    emit("accept", { index: props.index, value: parseFloat(display.value) });
  }

  function closeModal() {
    clearCalc();
    emit("close");
  }

  // --------------------
  //   Manejo del teclado
  // --------------------
  function handleKey(event) {
    if (!props.show) return;

    const key = event.key;

    if (!isNaN(key)) {
      pressNumber(key);
      return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
      pressOperator(key);
      return;
    }

    if (key === "Enter") {
      calculate();
      return;
    }

    if (key === "Escape") {
      closeModal();
      return;
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKey);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKey);
  });
</script>

<template>
  <div v-if="show" class="modal-background">
    <div class="modal">
      <h2 class="title">Calculadora</h2>

      <!-- Operación actual -->
      <div class="operation">{{ operationString }}</div>

      <!-- Display -->
      <input class="display" readonly :value="display" />

      <div class="buttons">
        <button
          v-for="n in ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0']"
          :key="n"
          @click="pressNumber(n)"
        >
          {{ n }}
        </button>

        <button @click="pressOperator('+')">+</button>
        <button @click="pressOperator('-')">-</button>
        <button @click="pressOperator('*')">*</button>
        <button @click="pressOperator('/')">/</button>

        <button @click="calculate()">=</button>
        <button @click="clearCalc()">C</button>

        <button class="accept" @click="acceptResult()">Aceptar</button>
        <button class="close" @click="closeModal()">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* === Modal background === */
  .modal-background {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  /* === Modal Box === */
  .modal {
    width: 300px;
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .title {
    text-align: center;
    margin-bottom: 5px;
  }

  .operation {
    font-size: 16px;
    min-height: 20px;
    text-align: right;
    color: #666;
  }

  .display {
    width: 100%;
    font-size: 22px;
    padding: 10px;
    text-align: right;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  button {
    padding: 12px;
    font-size: 18px;
    border: none;
    background: #e8e8e8;
    border-radius: 8px;
    cursor: pointer;
  }

  button:active {
    background: #ccc;
  }

  .accept {
    background: #4caf50;
    color: white;
    grid-column: span 4;
  }

  .close {
    background: #d9534f;
    color: white;
    grid-column: span 4;
  }
</style>
