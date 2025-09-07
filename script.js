// 布料统计管理系统 JavaScript
class FabricManager {
    constructor() {
        this.fabrics = [];
        this.outboundRecords = [];
        this.currentEditId = null;
        this.currentTab = 'inventory';
        this.init();
    }

    // 初始化
    init() {
        this.loadData();
        this.bindEvents();
        this.initTabs();
        this.updateDisplay();
        this.initMobileOptimizations();
        this.displayRecognitionStats();
    }

    // 绑定事件
    bindEvents() {
        // 表单提交
        document.getElementById('fabricForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFabric();
        });

        // 出库表单提交
        document.getElementById('outboundForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processOutbound();
        });

        // 编辑表单提交
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateFabric();
        });

        // 搜索和筛选
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterFabrics();
        });

        document.getElementById('filterType').addEventListener('change', () => {
            this.filterFabrics();
        });

        // 操作按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // 出库相关事件
        document.getElementById('outboundFabric').addEventListener('change', () => {
            this.updateAvailableLength();
        });

        document.getElementById('exportOutboundBtn').addEventListener('click', () => {
            this.exportOutboundData();
        });

        document.getElementById('clearOutboundBtn').addEventListener('click', () => {
            this.clearOutboundData();
        });

        // 出库记录搜索和筛选
        document.getElementById('outboundSearchInput').addEventListener('input', () => {
            this.filterOutboundRecords();
        });

        document.getElementById('filterPurpose').addEventListener('change', () => {
            this.filterOutboundRecords();
        });

        document.getElementById('filterDate').addEventListener('change', () => {
            this.filterOutboundRecords();
        });

        // 模态框
        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // 账单识别相关事件
        this.bindBillRecognitionEvents();

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.closeModal();
            }
        });
    }

    // 添加布料
    addFabric() {
        const formData = new FormData(document.getElementById('fabricForm'));
        const fabric = {
            id: Date.now().toString(),
            name: formData.get('fabricName'),
            type: formData.get('fabricType'),
            color: formData.get('fabricColor'),
            width: parseFloat(formData.get('fabricWidth')),
            length: parseFloat(formData.get('fabricLength')),
            remainingLength: parseFloat(formData.get('fabricLength')),
            price: parseFloat(formData.get('fabricPrice')),
            supplier: formData.get('fabricSupplier') || '',
            notes: formData.get('fabricNotes') || '',
            createdAt: new Date().toISOString()
        };

        // 验证数据
        if (!this.validateFabric(fabric)) {
            return;
        }

        this.fabrics.push(fabric);
        this.saveData();
        this.updateDisplay();
        this.resetForm();
        this.showAlert('布料添加成功！', 'success');
    }

    // 验证布料数据
    validateFabric(fabric) {
        if (!fabric.name.trim()) {
            this.showAlert('请输入布料名称', 'error');
            return false;
        }
        if (!fabric.type) {
            this.showAlert('请选择布料类型', 'error');
            return false;
        }
        if (!fabric.color.trim()) {
            this.showAlert('请输入颜色', 'error');
            return false;
        }
        if (fabric.width <= 0) {
            this.showAlert('幅宽必须大于0', 'error');
            return false;
        }
        if (fabric.length <= 0) {
            this.showAlert('长度必须大于0', 'error');
            return false;
        }
        if (fabric.price <= 0) {
            this.showAlert('单价必须大于0', 'error');
            return false;
        }
        return true;
    }

    // 编辑布料
    editFabric(id) {
        const fabric = this.fabrics.find(f => f.id === id);
        if (!fabric) return;

        this.currentEditId = id;
        
        // 填充编辑表单
        document.getElementById('editId').value = fabric.id;
        document.getElementById('editFabricName').value = fabric.name;
        document.getElementById('editFabricType').value = fabric.type;
        document.getElementById('editFabricColor').value = fabric.color;
        document.getElementById('editFabricWidth').value = fabric.width;
        document.getElementById('editFabricLength').value = fabric.length;
        document.getElementById('editFabricPrice').value = fabric.price;
        document.getElementById('editFabricSupplier').value = fabric.supplier;
        document.getElementById('editFabricNotes').value = fabric.notes;

        // 显示模态框
        document.getElementById('editModal').style.display = 'block';
    }

    // 更新布料
    updateFabric() {
        const formData = new FormData(document.getElementById('editForm'));
        const updatedFabric = {
            id: this.currentEditId,
            name: formData.get('fabricName'),
            type: formData.get('fabricType'),
            color: formData.get('fabricColor'),
            width: parseFloat(formData.get('fabricWidth')),
            length: parseFloat(formData.get('fabricLength')),
            price: parseFloat(formData.get('fabricPrice')),
            supplier: formData.get('fabricSupplier') || '',
            notes: formData.get('fabricNotes') || '',
            updatedAt: new Date().toISOString()
        };

        // 验证数据
        if (!this.validateFabric(updatedFabric)) {
            return;
        }

        const index = this.fabrics.findIndex(f => f.id === this.currentEditId);
        if (index !== -1) {
            // 保留创建时间
            updatedFabric.createdAt = this.fabrics[index].createdAt;
            this.fabrics[index] = updatedFabric;
            this.saveData();
            this.updateDisplay();
            this.closeModal();
            this.showAlert('布料信息更新成功！', 'success');
        }
    }

    // 删除布料
    deleteFabric(id) {
        if (confirm('确定要删除这个布料吗？')) {
            this.fabrics = this.fabrics.filter(f => f.id !== id);
            this.saveData();
            this.updateDisplay();
            this.showAlert('布料删除成功！', 'success');
        }
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditId = null;
    }

    // 重置表单
    resetForm() {
        document.getElementById('fabricForm').reset();
    }

    // 初始化标签
    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
        this.updateOutboundFabricOptions();
    }

    // 切换标签
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        
        // 显示对应的列表区域
        if (tabName === 'inventory') {
            document.querySelector('.fabric-list-section').style.display = 'block';
            document.getElementById('outbound-records').style.display = 'none';
        } else if (tabName === 'outbound') {
            document.querySelector('.fabric-list-section').style.display = 'none';
            document.getElementById('outbound-records').style.display = 'block';
            this.updateOutboundDisplay();
        }
    }

    // 更新显示
    updateDisplay() {
        this.updateStats();
        this.updateCategoryStats();
        this.updateFabricTable();
        
        // 更新出库相关显示
        this.updateOutboundFabricOptions();
        if (this.currentTab === 'outbound') {
            this.updateOutboundDisplay();
        }
    }

    // 更新统计数据
    updateStats() {
        const totalFabrics = this.fabrics.length;
        const totalLength = this.fabrics.reduce((sum, fabric) => sum + fabric.length, 0);
        const totalValue = this.fabrics.reduce((sum, fabric) => sum + (fabric.length * fabric.price), 0);
        const totalTypes = new Set(this.fabrics.map(f => f.type)).size;

        document.getElementById('totalFabrics').textContent = totalFabrics;
        document.getElementById('totalLength').textContent = totalLength.toFixed(2);
        document.getElementById('totalValue').textContent = `¥${totalValue.toFixed(2)}`;
        document.getElementById('totalTypes').textContent = totalTypes;
    }

    // 更新分类统计
    updateCategoryStats() {
        const categoryStats = {};
        
        this.fabrics.forEach(fabric => {
            if (!categoryStats[fabric.type]) {
                categoryStats[fabric.type] = {
                    count: 0,
                    length: 0,
                    value: 0
                };
            }
            categoryStats[fabric.type].count++;
            categoryStats[fabric.type].length += fabric.length;
            categoryStats[fabric.type].value += fabric.length * fabric.price;
        });

        const container = document.getElementById('categoryStats');
        container.innerHTML = '';

        if (Object.keys(categoryStats).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096;">暂无数据</p>';
            return;
        }

        Object.entries(categoryStats).forEach(([type, stats]) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <div>
                    <div class="category-name">${type}</div>
                    <div style="font-size: 0.8rem; color: #718096;">
                        ${stats.count}件 | ${stats.length.toFixed(2)}米
                    </div>
                </div>
                <div class="category-value">¥${stats.value.toFixed(2)}</div>
            `;
            container.appendChild(item);
        });
    }

    // 更新布料表格
    updateFabricTable() {
        const tbody = document.getElementById('fabricTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (this.fabrics.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        tbody.innerHTML = this.fabrics.map(fabric => `
            <tr>
                <td>${fabric.name}</td>
                <td>${fabric.type}</td>
                <td>${fabric.color}</td>
                <td>${fabric.width}</td>
                <td>${fabric.length}</td>
                <td>¥${fabric.price.toFixed(2)}</td>
                <td>¥${(fabric.length * fabric.price).toFixed(2)}</td>
                <td>${fabric.supplier}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="fabricManager.editFabric('${fabric.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="action-btn delete-btn" onclick="fabricManager.deleteFabric('${fabric.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 筛选布料
    filterFabrics() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filterType = document.getElementById('filterType').value;
        
        let filteredFabrics = this.fabrics;

        // 按搜索词筛选
        if (searchTerm) {
            filteredFabrics = filteredFabrics.filter(fabric => 
                fabric.name.toLowerCase().includes(searchTerm) ||
                fabric.color.toLowerCase().includes(searchTerm) ||
                fabric.supplier.toLowerCase().includes(searchTerm)
            );
        }

        // 按类型筛选
        if (filterType) {
            filteredFabrics = filteredFabrics.filter(fabric => fabric.type === filterType);
        }

        // 更新表格显示
        const tbody = document.getElementById('fabricTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (filteredFabrics.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <p>没有找到匹配的布料</p>
            `;
            return;
        }

        emptyState.style.display = 'none';
        
        tbody.innerHTML = filteredFabrics.map(fabric => `
            <tr>
                <td>${fabric.name}</td>
                <td>${fabric.type}</td>
                <td>${fabric.color}</td>
                <td>${fabric.width}</td>
                <td>${fabric.length}</td>
                <td>¥${fabric.price.toFixed(2)}</td>
                <td>¥${(fabric.length * fabric.price).toFixed(2)}</td>
                <td>${fabric.supplier}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="fabricManager.editFabric('${fabric.id}')">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="action-btn delete-btn" onclick="fabricManager.deleteFabric('${fabric.id}')">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 保存数据到本地存储
    saveData() {
        try {
            localStorage.setItem('fabricData', JSON.stringify(this.fabrics));
            localStorage.setItem('outboundData', JSON.stringify(this.outboundRecords));
        } catch (error) {
            console.error('保存数据失败:', error);
            this.showAlert('保存数据失败', 'error');
        }
    }

    // 从本地存储加载数据
    loadData() {
        try {
            const data = localStorage.getItem('fabricData');
            if (data) {
                this.fabrics = JSON.parse(data);
                // 确保每个布料都有剩余长度
                this.fabrics.forEach(fabric => {
                    if (fabric.remainingLength === undefined) {
                        fabric.remainingLength = fabric.length;
                    }
                });
            }
            
            const outboundData = localStorage.getItem('outboundData');
            if (outboundData) {
                this.outboundRecords = JSON.parse(outboundData);
            }
            
            // 为旧数据添加remainingLength属性并重新保存
            if (this.fabrics.length > 0) {
                let needsSave = false;
                this.fabrics.forEach(fabric => {
                    if (fabric.remainingLength === undefined) {
                        fabric.remainingLength = fabric.length;
                        needsSave = true;
                    }
                });
                if (needsSave) {
                    this.saveData();
                }
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            this.fabrics = [];
            this.outboundRecords = [];
        }
    }

    // 导出数据
    exportData() {
        if (this.fabrics.length === 0) {
            this.showAlert('没有数据可导出', 'error');
            return;
        }

        try {
            // 创建CSV内容
            const headers = ['名称', '类型', '颜色', '幅宽(cm)', '长度(m)', '单价(元/米)', '总价值', '供应商', '备注', '创建时间'];
            const csvContent = [
                headers.join(','),
                ...this.fabrics.map(fabric => [
                    `"${fabric.name}"`,
                    `"${fabric.type}"`,
                    `"${fabric.color}"`,
                    fabric.width,
                    fabric.length,
                    fabric.price,
                    (fabric.length * fabric.price).toFixed(2),
                    `"${fabric.supplier}"`,
                    `"${fabric.notes}"`,
                    `"${new Date(fabric.createdAt).toLocaleString()}"`
                ].join(','))
            ].join('\n');

            // 创建并下载文件
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `布料统计_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showAlert('数据导出成功！', 'success');
        } catch (error) {
            console.error('导出失败:', error);
            this.showAlert('导出失败', 'error');
        }
    }

    // 导入数据
    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    if (confirm('导入数据将覆盖现有数据，确定继续吗？')) {
                        this.fabrics = data;
                        this.saveData();
                        this.updateDisplay();
                        this.showAlert('数据导入成功！', 'success');
                    }
                } else {
                    this.showAlert('文件格式不正确', 'error');
                }
            } catch (error) {
                console.error('导入失败:', error);
                this.showAlert('文件格式不正确', 'error');
            }
        };
        reader.readAsText(file);
    }

    // 清空数据
    clearData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            this.fabrics = [];
            this.saveData();
            this.updateDisplay();
            this.showAlert('数据已清空', 'success');
        }
    }

    // 显示提示信息
    showAlert(message, type = 'info') {
        // 移除现有的提示
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // 创建新提示
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // 插入到页面顶部
        const container = document.querySelector('.container');
        container.insertBefore(alert, container.firstChild);

        // 3秒后自动移除
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }

    // 获取统计报告
    getStatisticsReport() {
        const totalFabrics = this.fabrics.length;
        const totalLength = this.fabrics.reduce((sum, fabric) => sum + fabric.length, 0);
        const totalValue = this.fabrics.reduce((sum, fabric) => sum + (fabric.length * fabric.price), 0);
        const avgPrice = totalLength > 0 ? totalValue / totalLength : 0;
        
        const typeStats = {};
        this.fabrics.forEach(fabric => {
            if (!typeStats[fabric.type]) {
                typeStats[fabric.type] = { count: 0, length: 0, value: 0 };
            }
            typeStats[fabric.type].count++;
            typeStats[fabric.type].length += fabric.length;
            typeStats[fabric.type].value += fabric.length * fabric.price;
        });

        return {
            totalFabrics,
            totalLength: totalLength.toFixed(2),
            totalValue: totalValue.toFixed(2),
            avgPrice: avgPrice.toFixed(2),
            typeStats
        };
    }

    // ========== 出库系统方法 ==========

    // 更新出库布料选项
    updateOutboundFabricOptions() {
        const select = document.getElementById('outboundFabric');
        const availableFabrics = this.fabrics.filter(fabric => fabric.remainingLength > 0);
        
        select.innerHTML = '<option value="">请选择要出库的布料</option>';
        
        availableFabrics.forEach(fabric => {
            const option = document.createElement('option');
            option.value = fabric.id;
            option.textContent = `${fabric.name} (${fabric.type}, ${fabric.color}) - 剩余: ${fabric.remainingLength.toFixed(2)}m`;
            select.appendChild(option);
        });
    }

    // 更新可用长度显示
    updateAvailableLength() {
        const fabricId = document.getElementById('outboundFabric').value;
        const availableLengthInput = document.getElementById('availableLength');
        
        if (fabricId) {
            const fabric = this.fabrics.find(f => f.id === fabricId);
            if (fabric) {
                availableLengthInput.value = fabric.remainingLength.toFixed(2);
            }
        } else {
            availableLengthInput.value = '';
        }
    }

    // 处理出库
    processOutbound() {
        const formData = new FormData(document.getElementById('outboundForm'));
        const fabricId = formData.get('outboundFabric');
        const outboundLength = parseFloat(formData.get('outboundLength'));
        const purpose = formData.get('outboundPurpose');
        const operator = formData.get('outboundOperator');
        const notes = formData.get('outboundNotes') || '';
        
        // 验证数据
        if (!fabricId || !outboundLength || !purpose || !operator) {
            this.showAlert('请填写所有必填字段', 'error');
            return;
        }
        
        const fabric = this.fabrics.find(f => f.id === fabricId);
        if (!fabric) {
            this.showAlert('选择的布料不存在', 'error');
            return;
        }
        
        if (outboundLength > fabric.remainingLength) {
            this.showAlert(`出库长度不能超过剩余长度 ${fabric.remainingLength.toFixed(2)}m`, 'error');
            return;
        }
        
        if (outboundLength <= 0) {
            this.showAlert('出库长度必须大于0', 'error');
            return;
        }
        
        // 创建出库记录
        const outboundRecord = {
            id: Date.now().toString(),
            fabricId: fabricId,
            fabricName: fabric.name,
            fabricType: fabric.type,
            fabricColor: fabric.color,
            outboundLength: outboundLength,
            unitPrice: fabric.price,
            totalValue: outboundLength * fabric.price,
            purpose: purpose,
            operator: operator,
            notes: notes,
            outboundDate: new Date().toISOString()
        };
        
        // 更新库存
        fabric.remainingLength -= outboundLength;
        
        // 添加出库记录
        this.outboundRecords.push(outboundRecord);
        
        // 保存数据
        this.saveData();
        
        // 更新显示
        this.updateDisplay();
        
        // 重置表单
        document.getElementById('outboundForm').reset();
        document.getElementById('availableLength').value = '';
        
        this.showAlert('出库成功！', 'success');
    }

    // 更新出库显示
    updateOutboundDisplay() {
        this.updateOutboundStats();
        this.updatePurposeStats();
        this.updateOutboundTable();
    }

    // 更新出库统计
    updateOutboundStats() {
        const totalOutbounds = this.outboundRecords.length;
        const totalOutboundLength = this.outboundRecords.reduce((sum, record) => sum + record.outboundLength, 0);
        const totalOutboundValue = this.outboundRecords.reduce((sum, record) => sum + record.totalValue, 0);
        
        // 今日出库
        const today = new Date().toDateString();
        const todayOutbounds = this.outboundRecords.filter(record => 
            new Date(record.outboundDate).toDateString() === today
        ).length;
        
        document.getElementById('totalOutbounds').textContent = totalOutbounds;
        document.getElementById('totalOutboundLength').textContent = totalOutboundLength.toFixed(2);
        document.getElementById('totalOutboundValue').textContent = `¥${totalOutboundValue.toFixed(2)}`;
        document.getElementById('todayOutbounds').textContent = todayOutbounds;
    }

    // 更新用途统计
    updatePurposeStats() {
        const purposeStats = {};
        
        this.outboundRecords.forEach(record => {
            if (!purposeStats[record.purpose]) {
                purposeStats[record.purpose] = {
                    count: 0,
                    length: 0,
                    value: 0
                };
            }
            purposeStats[record.purpose].count++;
            purposeStats[record.purpose].length += record.outboundLength;
            purposeStats[record.purpose].value += record.totalValue;
        });
        
        const container = document.getElementById('purposeStats');
        container.innerHTML = '';
        
        if (Object.keys(purposeStats).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #718096;">暂无数据</p>';
            return;
        }
        
        Object.entries(purposeStats).forEach(([purpose, stats]) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <div>
                    <div class="category-name">${purpose}</div>
                    <div style="font-size: 0.8rem; color: #718096;">
                        ${stats.count}次 | ${stats.length.toFixed(2)}米
                    </div>
                </div>
                <div class="category-value">¥${stats.value.toFixed(2)}</div>
            `;
            container.appendChild(item);
        });
    }

    // 更新出库记录表格
    updateOutboundTable() {
        const tbody = document.getElementById('outboundTableBody');
        const emptyState = document.getElementById('outboundEmptyState');
        
        if (this.outboundRecords.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // 按时间倒序排列
        const sortedRecords = [...this.outboundRecords].sort((a, b) => 
            new Date(b.outboundDate) - new Date(a.outboundDate)
        );
        
        tbody.innerHTML = sortedRecords.map(record => {
            const date = new Date(record.outboundDate);
            const formattedDate = date.toLocaleString('zh-CN');
            
            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${record.fabricName}</td>
                    <td>${record.fabricType}</td>
                    <td>${record.fabricColor}</td>
                    <td>${record.outboundLength.toFixed(2)}</td>
                    <td>¥${record.unitPrice.toFixed(2)}</td>
                    <td>¥${record.totalValue.toFixed(2)}</td>
                    <td>${record.purpose}</td>
                    <td>${record.operator}</td>
                    <td>${record.notes}</td>
                </tr>
            `;
        }).join('');
    }

    // 筛选出库记录
    filterOutboundRecords() {
        const searchTerm = document.getElementById('outboundSearchInput').value.toLowerCase();
        const filterPurpose = document.getElementById('filterPurpose').value;
        const filterDate = document.getElementById('filterDate').value;
        
        let filteredRecords = this.outboundRecords;
        
        // 按搜索词筛选
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.fabricName.toLowerCase().includes(searchTerm) ||
                record.operator.toLowerCase().includes(searchTerm) ||
                record.notes.toLowerCase().includes(searchTerm)
            );
        }
        
        // 按用途筛选
        if (filterPurpose) {
            filteredRecords = filteredRecords.filter(record => record.purpose === filterPurpose);
        }
        
        // 按日期筛选
        if (filterDate) {
            filteredRecords = filteredRecords.filter(record => {
                const recordDate = new Date(record.outboundDate).toDateString();
                const selectedDate = new Date(filterDate).toDateString();
                return recordDate === selectedDate;
            });
        }
        
        // 更新表格显示
        const tbody = document.getElementById('outboundTableBody');
        const emptyState = document.getElementById('outboundEmptyState');
        
        if (filteredRecords.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <p>没有找到匹配的出库记录</p>
            `;
            return;
        }
        
        emptyState.style.display = 'none';
        
        // 按时间倒序排列
        const sortedRecords = [...filteredRecords].sort((a, b) => 
            new Date(b.outboundDate) - new Date(a.outboundDate)
        );
        
        tbody.innerHTML = sortedRecords.map(record => {
            const date = new Date(record.outboundDate);
            const formattedDate = date.toLocaleString('zh-CN');
            
            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${record.fabricName}</td>
                    <td>${record.fabricType}</td>
                    <td>${record.fabricColor}</td>
                    <td>${record.outboundLength.toFixed(2)}</td>
                    <td>¥${record.unitPrice.toFixed(2)}</td>
                    <td>¥${record.totalValue.toFixed(2)}</td>
                    <td>${record.purpose}</td>
                    <td>${record.operator}</td>
                    <td>${record.notes}</td>
                </tr>
            `;
        }).join('');
    }

    // 导出出库数据
    exportOutboundData() {
        if (this.outboundRecords.length === 0) {
            this.showAlert('没有出库记录可导出', 'error');
            return;
        }
        
        const headers = ['出库时间', '布料名称', '类型', '颜色', '出库长度(m)', '单价(元/米)', '出库价值', '用途', '操作员', '备注'];
        const csvContent = [headers.join(',')];
        
        this.outboundRecords.forEach(record => {
            const row = [
                new Date(record.outboundDate).toLocaleString('zh-CN'),
                record.fabricName,
                record.fabricType,
                record.fabricColor,
                record.outboundLength.toFixed(2),
                record.unitPrice.toFixed(2),
                record.totalValue.toFixed(2),
                record.purpose,
                record.operator,
                record.notes
            ];
            csvContent.push(row.join(','));
        });
        
        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `出库记录_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showAlert('出库记录导出成功！', 'success');
    }

    // 清空出库数据
    clearOutboundData() {
        if (this.outboundRecords.length === 0) {
            this.showAlert('没有出库记录可清空', 'error');
            return;
        }
        
        if (confirm('确定要清空所有出库记录吗？此操作不可恢复！')) {
            // 恢复所有布料的剩余长度
            this.outboundRecords.forEach(record => {
                const fabric = this.fabrics.find(f => f.id === record.fabricId);
                if (fabric) {
                    fabric.remainingLength += record.outboundLength;
                }
            });
            
            this.outboundRecords = [];
            this.saveData();
            this.updateDisplay();
            this.showAlert('出库记录已清空，库存已恢复！', 'success');
        }
    }

    // ========== 移动端优化方法 ==========

    // 初始化移动端优化
    initMobileOptimizations() {
        this.initTableScrollIndicator();
        this.initTouchFeedback();
    }

    // 绑定账单识别事件
    bindBillRecognitionEvents() {
        const uploadZone = document.getElementById('uploadZone');
        const billImageInput = document.getElementById('billImageInput');
        const reuploadBtn = document.getElementById('reuploadBtn');
        const recognizeBtn = document.getElementById('recognizeBtn');
        const billForm = document.getElementById('billForm');
        const resetBillForm = document.getElementById('resetBillForm');

        // 点击上传区域
        uploadZone.addEventListener('click', () => {
            billImageInput.click();
        });

        // 文件选择
        billImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });

        // 拖拽上传
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
                this.handleFileUpload(file);
            }
        });

        // 重新上传
        reuploadBtn.addEventListener('click', () => {
            this.resetImageUpload();
        });

        // 开始识别
        recognizeBtn.addEventListener('click', () => {
            this.startRecognition();
        });

        // 账单表单提交
        billForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBillRecognitionResult();
        });

        // 重置表单
        resetBillForm.addEventListener('click', () => {
            this.resetBillForm();
        });
    }

    // 处理文件上传（图片或PDF）
    handleFileUpload(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            this.showAlert('请选择图片文件或PDF文件', 'error');
            return;
        }

        // 验证文件大小 (最大20MB)
        if (file.size > 20 * 1024 * 1024) {
            this.showAlert('文件过大，请选择小于20MB的文件', 'error');
            return;
        }

        this.currentBillFile = file;
        
        if (file.type === 'application/pdf') {
            this.handlePDFUpload(file);
        } else {
            this.handleImageUpload(file);
        }
    }

    // 处理图片上传
    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(e.target.result);
            this.currentBillImage = file;
        };
        reader.readAsDataURL(file);
    }

    // 处理PDF上传
    async handlePDFUpload(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            // 获取第一页
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            
            // 创建canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // 渲染PDF页面到canvas
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // 将canvas转换为图片数据
            const imageDataUrl = canvas.toDataURL('image/png');
            this.displayImagePreview(imageDataUrl);
            
            // 将canvas转换为blob用于OCR
            canvas.toBlob((blob) => {
                this.currentBillImage = blob;
            }, 'image/png');
            
        } catch (error) {
            console.error('PDF处理失败:', error);
            this.showAlert('PDF文件处理失败，请重试', 'error');
        }
    }

    // 显示图片预览
    displayImagePreview(imageSrc) {
        const uploadZone = document.getElementById('uploadZone');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');

        uploadZone.style.display = 'none';
        previewImage.src = imageSrc;
        imagePreview.style.display = 'block';
    }

    // 重置文件上传
    resetImageUpload() {
        const uploadZone = document.getElementById('uploadZone');
        const imagePreview = document.getElementById('imagePreview');
        const billImageInput = document.getElementById('billImageInput');
        const recognitionProgress = document.getElementById('recognitionProgress');
        const recognitionResult = document.getElementById('recognitionResult');

        uploadZone.style.display = 'block';
        imagePreview.style.display = 'none';
        recognitionProgress.style.display = 'none';
        recognitionResult.style.display = 'none';
        billImageInput.value = '';
        this.currentBillImage = null;
        this.currentBillFile = null;
    }

    // 开始识别
    async startRecognition() {
        if (!this.currentBillImage && !this.currentBillFile) {
            this.showAlert('请先上传文件', 'error');
            return;
        }
        
        // 如果是PDF文件但还没有转换为图片，等待转换完成
        if (this.currentBillFile && this.currentBillFile.type === 'application/pdf' && !this.currentBillImage) {
            this.showAlert('PDF文件正在处理中，请稍候...', 'info');
            return;
        }

        const imagePreview = document.getElementById('imagePreview');
        const recognitionProgress = document.getElementById('recognitionProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        // 显示进度条
        imagePreview.style.display = 'none';
        recognitionProgress.style.display = 'block';

        try {
            // 模拟进度更新
            this.updateProgress(progressFill, progressText, 10, '正在加载OCR引擎...');
            console.log('开始OCR识别流程');
            
            // 加载Tesseract.js
            if (!window.Tesseract) {
                console.log('Tesseract.js未加载，开始加载...');
                await this.loadTesseract();
                console.log('Tesseract.js加载完成');
            } else {
                console.log('Tesseract.js已存在');
            }
            
            this.updateProgress(progressFill, progressText, 30, '正在分析图片...');
            
            // 执行OCR识别
            console.log('开始OCR识别，图片源类型:', typeof this.currentBillImage);
            console.log('图片源长度:', this.currentBillImage ? this.currentBillImage.length : 'null');
            
            const result = await this.performOCR(this.currentBillImage);
            console.log('OCR识别完成');
            console.log('置信度:', result.data.confidence);
            console.log('识别文本长度:', result.data.text.length);
            console.log('识别文本预览:', result.data.text.substring(0, 100));
            
            this.updateProgress(progressFill, progressText, 80, '正在提取信息...');
            
            // 检查识别结果质量
            if (result.data.confidence < 30) {
                console.warn('OCR识别置信度较低:', result.data.confidence);
                this.showAlert(`识别置信度较低(${result.data.confidence.toFixed(1)}%)，建议使用更清晰的图片。\n\n调试提示：请检查图片是否清晰、文字是否完整、光线是否充足。`, 'warning');
            } else if (result.data.confidence > 80) {
                console.log('OCR识别质量良好:', result.data.confidence);
                this.showAlert(`识别效果良好(${result.data.confidence.toFixed(1)}%)`, 'success');
            }
            
            // 检查识别文本是否为空
            if (!result.data.text || result.data.text.trim().length === 0) {
                console.warn('OCR识别结果为空');
                this.showAlert('未识别到任何文字，请检查图片质量或尝试其他图片', 'error');
                return;
            }
            
            // 解析识别结果
            const extractedData = this.extractBillInfo(result.data.text);
            
            this.updateProgress(progressFill, progressText, 100, '识别完成！');
            
            // 显示识别结果
            setTimeout(() => {
                this.displayRecognitionResult(extractedData);
                this.updateRecognitionStats(true);
            }, 500);
            
        } catch (error) {
            console.error('识别失败:', error);
            this.showAlert('识别失败，请重试', 'error');
            this.updateRecognitionStats(false);
            this.resetImageUpload();
        }
    }

    // 加载Tesseract.js
    async loadTesseract() {
        return new Promise((resolve, reject) => {
            if (window.Tesseract) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 执行OCR识别
    async performOCR(imageSource) {
        let worker = null;
        try {
            console.log('创建OCR Worker...');
            worker = await Tesseract.createWorker('chi_sim+eng');
            console.log('OCR Worker创建成功');
            
            // 设置识别参数以提高准确性
            console.log('设置OCR参数...');
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz一二三四五六七八九十百千万元米厘分布料棉丝麻毛化纤红蓝绿黄黑白灰紫粉橙棕公司厂店',
                tessedit_pageseg_mode: Tesseract.PSM.AUTO
            });
            console.log('OCR参数设置完成');
            
            console.log('开始识别图片...');
            const result = await worker.recognize(imageSource);
            console.log('图片识别完成');
            
            // 验证结果
            if (!result || !result.data) {
                throw new Error('OCR识别返回无效结果');
            }
            
            if (typeof result.data.confidence !== 'number') {
                console.warn('置信度数据异常，设置默认值');
                result.data.confidence = 0;
            }
            
            if (typeof result.data.text !== 'string') {
                console.warn('文本数据异常，设置默认值');
                result.data.text = '';
            }
            
            return result;
            
        } catch (error) {
            console.error('OCR识别过程中出错:', error);
            throw new Error(`OCR识别失败: ${error.message}`);
        } finally {
            if (worker) {
                try {
                    console.log('终止OCR Worker...');
                    await worker.terminate();
                    console.log('OCR Worker已终止');
                } catch (terminateError) {
                    console.warn('终止OCR Worker时出错:', terminateError);
                }
            }
        }
    }

    // 更新进度
    updateProgress(progressFill, progressText, percentage, text) {
        progressFill.style.width = percentage + '%';
        progressText.textContent = text;
    }

    // 提取账单信息
    extractBillInfo(text) {
        console.log('OCR识别原始文本:', text);
        
        if (!text || text.trim().length === 0) {
            console.warn('OCR识别结果为空');
            return {
                fabricName: '未识别',
                fabricType: '其他',
                fabricColor: '',
                fabricWidth: '',
                fabricLength: '',
                fabricPrice: '',
                fabricSupplier: '',
                fabricNotes: 'OCR识别结果为空，请检查图片质量'
            };
        }
        
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        console.log('处理后的文本行:', lines);
        
        const extractedData = {
            fabricName: '',
            fabricType: '',
            fabricColor: '',
            fabricWidth: '',
            fabricLength: '',
            fabricPrice: '',
            fabricSupplier: '',
            fabricNotes: `从账单识别获取 (共识别${lines.length}行文本)`
        };

        // 改进的信息提取逻辑
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            
            // 提取布料名称（更宽泛的匹配）
            if ((line.includes('布') || line.includes('料') || line.includes('纺') || 
                 line.includes('织') || line.includes('绸') || line.includes('麻') || 
                 line.includes('棉') || line.includes('毛')) && !extractedData.fabricName) {
                extractedData.fabricName = line;
                console.log('识别到布料名称:', line);
            }
            
            // 提取颜色信息（扩展颜色列表）
            const colors = ['红', '蓝', '绿', '黄', '黑', '白', '灰', '紫', '粉', '橙', '棕', 
                          '深', '浅', '亮', '暗', '米', '咖', '银', '金', '青', '蓝绿', '玫红'];
            for (const color of colors) {
                if (line.includes(color) && !extractedData.fabricColor) {
                    extractedData.fabricColor = color;
                    console.log('识别到颜色:', color);
                    break;
                }
            }
            
            // 改进的数字提取逻辑
            const numbers = line.match(/\d+(\.\d+)?/g);
            if (numbers) {
                console.log(`第${i+1}行发现数字:`, numbers);
                for (const num of numbers) {
                    const value = parseFloat(num);
                    
                    // 检查上下文来判断数字含义
                    if (line.includes('宽') || line.includes('幅') || (value >= 100 && value <= 300)) {
                        if (!extractedData.fabricWidth) {
                            extractedData.fabricWidth = value;
                            console.log('识别到宽度:', value);
                        }
                    } else if (line.includes('长') || line.includes('米') || (value > 0 && value <= 100)) {
                        if (!extractedData.fabricLength) {
                            extractedData.fabricLength = value;
                            console.log('识别到长度:', value);
                        }
                    } else if (line.includes('价') || line.includes('元') || line.includes('￥') || line.includes('$')) {
                        if (!extractedData.fabricPrice) {
                            extractedData.fabricPrice = value;
                            console.log('识别到价格:', value);
                        }
                    }
                }
            }
            
            // 提取供应商信息（扩展关键词）
            if ((line.includes('公司') || line.includes('厂') || line.includes('店') || 
                 line.includes('商') || line.includes('贸易') || line.includes('纺织')) && 
                !extractedData.fabricSupplier) {
                extractedData.fabricSupplier = line;
                console.log('识别到供应商:', line);
            }
        }

        // 根据名称推断类型
        if (extractedData.fabricName) {
            const name = extractedData.fabricName;
            if (name.includes('棉')) extractedData.fabricType = '棉布';
            else if (name.includes('丝') || name.includes('绸')) extractedData.fabricType = '丝绸';
            else if (name.includes('麻')) extractedData.fabricType = '麻布';
            else if (name.includes('毛')) extractedData.fabricType = '毛料';
            else if (name.includes('化纤') || name.includes('聚酯') || name.includes('涤')) extractedData.fabricType = '化纤';
            else if (name.includes('牛仔')) extractedData.fabricType = '牛仔布';
            else if (name.includes('雪纺')) extractedData.fabricType = '雪纺';
            else extractedData.fabricType = '其他';
        } else {
            extractedData.fabricType = '其他';
        }
        
        // 如果没有识别到任何有用信息，设置默认值
        if (!extractedData.fabricName) {
            extractedData.fabricName = '未识别的布料';
        }

        console.log('最终提取结果:', extractedData);
        return extractedData;
    }

    // 显示识别结果
    displayRecognitionResult(data) {
        const recognitionProgress = document.getElementById('recognitionProgress');
        const recognitionResult = document.getElementById('recognitionResult');
        
        // 填充表单
        document.getElementById('billFabricName').value = data.fabricName || '';
        document.getElementById('billFabricType').value = data.fabricType || '';
        document.getElementById('billFabricColor').value = data.fabricColor || '';
        document.getElementById('billFabricWidth').value = data.fabricWidth || '';
        document.getElementById('billFabricLength').value = data.fabricLength || '';
        document.getElementById('billFabricPrice').value = data.fabricPrice || '';
        document.getElementById('billFabricSupplier').value = data.fabricSupplier || '';
        document.getElementById('billFabricNotes').value = data.fabricNotes || '';
        
        // 显示结果表单
        recognitionProgress.style.display = 'none';
        recognitionResult.style.display = 'block';
    }

    // 保存账单识别结果
    saveBillRecognitionResult() {
        const formData = new FormData(document.getElementById('billForm'));
        const fabric = {
            id: Date.now().toString(),
            name: formData.get('fabricName'),
            type: formData.get('fabricType'),
            color: formData.get('fabricColor'),
            width: parseFloat(formData.get('fabricWidth')),
            length: parseFloat(formData.get('fabricLength')),
            price: parseFloat(formData.get('fabricPrice')),
            supplier: formData.get('fabricSupplier'),
            notes: formData.get('fabricNotes'),
            createdAt: new Date().toISOString(),
            source: 'bill_recognition'
        };

        // 验证数据
        const validation = this.validateFabric(fabric);
        if (!validation.isValid) {
            this.showAlert(validation.message, 'error');
            return;
        }

        // 添加到库存
        this.fabrics.push(fabric);
        this.saveData();
        this.updateDisplay();
        
        // 重置界面
        this.resetImageUpload();
        this.resetBillForm();
        
        this.showAlert('账单识别结果已保存到库存！', 'success');
    }

    // 重置账单表单
    resetBillForm() {
        document.getElementById('billForm').reset();
    }

    // 更新识别统计
    updateRecognitionStats(success) {
        const stats = JSON.parse(localStorage.getItem('recognitionStats') || '{}');
        const today = new Date().toDateString();
        
        stats.totalRecognitions = (stats.totalRecognitions || 0) + 1;
        if (success) {
            stats.successfulRecognitions = (stats.successfulRecognitions || 0) + 1;
        }
        
        stats.todayRecognitions = stats.todayRecognitions || {};
        stats.todayRecognitions[today] = (stats.todayRecognitions[today] || 0) + 1;
        
        localStorage.setItem('recognitionStats', JSON.stringify(stats));
        this.displayRecognitionStats();
    }

    // 显示识别统计
    displayRecognitionStats() {
        const stats = JSON.parse(localStorage.getItem('recognitionStats') || '{}');
        const today = new Date().toDateString();
        
        const totalRecognitions = stats.totalRecognitions || 0;
        const successfulRecognitions = stats.successfulRecognitions || 0;
        const todayRecognitions = (stats.todayRecognitions && stats.todayRecognitions[today]) || 0;
        const accuracy = totalRecognitions > 0 ? Math.round((successfulRecognitions / totalRecognitions) * 100) : 0;
        
        document.getElementById('totalRecognitions').textContent = totalRecognitions;
        document.getElementById('successfulRecognitions').textContent = successfulRecognitions;
        document.getElementById('recognitionAccuracy').textContent = accuracy + '%';
        document.getElementById('todayRecognitions').textContent = todayRecognitions;
    }

    // 初始化表格滚动指示器
    initTableScrollIndicator() {
        const tableContainers = document.querySelectorAll('.table-container');
        
        tableContainers.forEach(container => {
            container.addEventListener('scroll', () => {
                if (container.scrollLeft > 0) {
                    container.classList.add('scrolled');
                } else {
                    container.classList.remove('scrolled');
                }
            });
        });
    }

    // 初始化触摸反馈
    initTouchFeedback() {
        // 为所有按钮添加触摸反馈
        const buttons = document.querySelectorAll('.btn, .tab-btn');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
            
            button.addEventListener('touchcancel', () => {
                button.style.transform = '';
            });
        });
    }
}

// 网络状态检测和性能优化
class NetworkOptimizer {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionType = this.getConnectionType();
        this.initNetworkMonitoring();
        this.initPerformanceOptimizations();
    }
    
    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }
    
    initNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('网络已连接', 'success');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('网络已断开，应用将在离线模式下运行', 'warning');
        });
        
        // 监听网络变化
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.connectionType = this.getConnectionType();
                this.optimizeForConnection();
            });
        }
    }
    
    initPerformanceOptimizations() {
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 图片懒加载（如果有的话）
        this.initLazyLoading();
        
        // 防抖优化
        this.initDebounceOptimizations();
    }
    
    preloadCriticalResources() {
        // 预加载字体和关键CSS
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        link.as = 'style';
        document.head.appendChild(link);
    }
    
    initLazyLoading() {
        // 为未来的图片元素准备懒加载
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            // 观察所有带有data-src的图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    initDebounceOptimizations() {
        // 为搜索输入添加防抖
        const searchInputs = document.querySelectorAll('#searchInput, #outboundSearchInput');
        searchInputs.forEach(input => {
            let timeout;
            const originalHandler = input.oninput;
            input.oninput = (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (originalHandler) originalHandler.call(input, e);
                }, 300);
            };
        });
    }
    
    optimizeForConnection() {
        // 根据网络状况调整功能
        if (this.connectionType === 'slow-2g' || this.connectionType === '2g') {
            // 低速网络优化
            this.enableLowBandwidthMode();
        } else {
            this.disableLowBandwidthMode();
        }
    }
    
    enableLowBandwidthMode() {
        // 减少动画和过渡效果
        document.body.classList.add('low-bandwidth');
        
        // 添加低带宽模式的CSS
        if (!document.getElementById('low-bandwidth-styles')) {
            const style = document.createElement('style');
            style.id = 'low-bandwidth-styles';
            style.textContent = `
                .low-bandwidth * {
                    transition: none !important;
                    animation: none !important;
                }
                .low-bandwidth .btn:hover {
                    transform: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    disableLowBandwidthMode() {
        document.body.classList.remove('low-bandwidth');
    }
    
    showNetworkStatus(message, type) {
        // 显示网络状态提示
        const existingAlert = document.querySelector('.network-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `network-alert alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#FF9800'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
    
    syncOfflineData() {
        // 同步离线期间的数据变更
        if (this.isOnline && fabricManager) {
            fabricManager.saveData();
        }
    }
}

// 初始化应用
let fabricManager;
let networkOptimizer;

document.addEventListener('DOMContentLoaded', () => {
    fabricManager = new FabricManager();
    networkOptimizer = new NetworkOptimizer();
});

// 导出到全局作用域，供HTML中的onclick使用
window.fabricManager = fabricManager;
window.networkOptimizer = networkOptimizer;